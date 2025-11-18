import type { LatLngTuple } from '../store/mapSlice';
import { km, tupleToLatLng } from './haversine';

export interface GridNode {
  row: number;
  col: number;
  lat: number;
  lng: number;
  g: number; // cost from start
  h: number; // heuristic (distance to goal)
  f: number; // g + h
  parent: GridNode | null;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const MAX_ITERATIONS = 5000;
const GRID_RESOLUTION = 100; // meters (approximate cell size)

/**
 * Convert degrees to approximate meters (rough approximation)
 */


/**
 * Create a coarse grid for A* pathfinding
 */
export function createGrid(bounds: Bounds): {
  grid: GridNode[][];
  cellSizeLat: number;
  cellSizeLng: number;
  rows: number;
  cols: number;
} {
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;
  
  // Approximate cell size in degrees
  const avgLat = (bounds.minLat + bounds.maxLat) / 2;
  const cellSizeLat = GRID_RESOLUTION / 111320; // ~100m in degrees
  const cellSizeLng = GRID_RESOLUTION / (111320 * Math.cos(avgLat * Math.PI / 180));
  
  const rows = Math.ceil(latRange / cellSizeLat);
  const cols = Math.ceil(lngRange / cellSizeLng);
  
  const grid: GridNode[][] = [];
  
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      const lat = bounds.minLat + row * cellSizeLat;
      const lng = bounds.minLng + col * cellSizeLng;
      grid[row][col] = {
        row,
        col,
        lat,
        lng,
        g: Infinity,
        h: 0,
        f: Infinity,
        parent: null,
      };
    }
  }
  
  return { grid, cellSizeLat, cellSizeLng, rows, cols };
}

/**
 * Get neighbors (8-way connectivity)
 */
function getNeighbors(node: GridNode, grid: GridNode[][]): GridNode[] {
  const neighbors: GridNode[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  
  for (const [dr, dc] of directions) {
    const newRow = node.row + dr;
    const newCol = node.col + dc;
    
    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  
  return neighbors;
}

/**
 * Find path using A* algorithm on a coarse grid
 * Falls back to straight line if iteration limit exceeded
 */
export function findPath(
  start: LatLngTuple,
  goal: LatLngTuple,
  bounds: Bounds
): LatLngTuple[] {
  const { grid, cellSizeLat, cellSizeLng } = createGrid(bounds);
  
  // Find start and goal cells
  const startRow = Math.floor((start[0] - bounds.minLat) / cellSizeLat);
  const startCol = Math.floor((start[1] - bounds.minLng) / cellSizeLng);
  const goalRow = Math.floor((goal[0] - bounds.minLat) / cellSizeLat);
  const goalCol = Math.floor((goal[1] - bounds.minLng) / cellSizeLng);
  
  // Clamp to grid bounds
  const clampedStartRow = Math.max(0, Math.min(grid.length - 1, startRow));
  const clampedStartCol = Math.max(0, Math.min(grid[0].length - 1, startCol));
  const clampedGoalRow = Math.max(0, Math.min(grid.length - 1, goalRow));
  const clampedGoalCol = Math.max(0, Math.min(grid[0].length - 1, goalCol));
  
  const startNode = grid[clampedStartRow][clampedStartCol];
  const goalNode = grid[clampedGoalRow][clampedGoalCol];
  
  // Initialize start node
  startNode.g = 0;
  startNode.h = km(tupleToLatLng(start), tupleToLatLng(goal));
  startNode.f = startNode.g + startNode.h;
  
  const openSet: GridNode[] = [startNode];
  const closedSet = new Set<string>();
  
  let iterations = 0;
  
  while (openSet.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    const currentKey = `${current.row},${current.col}`;
    closedSet.add(currentKey);
    
    // Check if we reached the goal
    if (current.row === goalNode.row && current.col === goalNode.col) {
      // Reconstruct path
      const path: LatLngTuple[] = [];
      let node: GridNode | null = current;
      
      while (node) {
        path.unshift([node.lat, node.lng]);
        node = node.parent;
      }
      
      // Add actual start and goal coordinates
      path[0] = start;
      path[path.length - 1] = goal;
      
      return path;
    }
    
    // Check neighbors
    const neighbors = getNeighbors(current, grid);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      // Calculate cost (Haversine distance)
      const cost = km(
        { lat: current.lat, lng: current.lng },
        { lat: neighbor.lat, lng: neighbor.lng }
      );
      
      const tentativeG = current.g + cost;
      
      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = km(
          { lat: neighbor.lat, lng: neighbor.lng },
          { lat: goalNode.lat, lng: goalNode.lng }
        );
        neighbor.f = neighbor.g + neighbor.h;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  // Fallback to straight line
  return [start, goal];
}

