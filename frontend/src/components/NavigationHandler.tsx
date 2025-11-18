import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngTuple } from '../store/mapSlice';
import type { Bounds } from '../utils/gridSearch';
import { findPath } from '../utils/gridSearch';
import { km, tupleToLatLng } from '../utils/haversine';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setRoute, clearRoute } from '../store/mapSlice';

interface Props {
  navigatingTo: { latitude?: number | string; longitude?: number | string } | null | undefined;
  userLocation: LatLngTuple | null;
}

const routesEqual = (a: LatLngTuple[], b: LatLngTuple[]) => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i][0] - b[i][0]) > 1e-6) return false;
    if (Math.abs(a[i][1] - b[i][1]) > 1e-6) return false;
  }
  return true;
};

export default function NavigationHandler({ navigatingTo, userLocation }: Props) {
  const map = useMap();
  const dispatch = useDispatch();
  const currentRoute = useSelector((s: RootState) => s.map.route);
  const lastDispatchedRef = useRef<string | null>(null);

  // Helper to stringify & round coordinates for stable comparison
  const routeToKey = (r: LatLngTuple[]) => r.map(p => `${p[0].toFixed(6)},${p[1].toFixed(6)}`).join('|');

  useEffect(() => {
    if (!navigatingTo || !userLocation || navigatingTo.latitude === undefined || navigatingTo.longitude === undefined) {
      // Only clear route if we previously had one
      if (!navigatingTo && lastDispatchedRef.current) {
        lastDispatchedRef.current = null;
        dispatch(clearRoute());
      }
      return;
    }

    const start: LatLngTuple = userLocation;
    const end: LatLngTuple = [
      parseFloat(String(navigatingTo.latitude)),
      parseFloat(String(navigatingTo.longitude)),
    ];

    // bounds read from map instance (map is stable for react-leaflet)
    const bounds = map.getBounds();
    const mapBounds: Bounds = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    };

    const path = findPath(start, end, mapBounds);

    // Make a stable key for comparison to avoid dispatching identical routes
    const newKey = routeToKey(path);
    if (lastDispatchedRef.current === newKey) return;

    // Also compare to currentRoute from store (if present)
    if (currentRoute && routeToKey(currentRoute) === newKey) {
      lastDispatchedRef.current = newKey;
      return;
    }

    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += km(tupleToLatLng(path[i]), tupleToLatLng(path[i + 1]));
    }

    const speedKmh = 50;
    const etaMins = (totalDistance / speedKmh) * 60;

    lastDispatchedRef.current = newKey;
    dispatch(setRoute({ route: path, distanceKm: totalDistance, etaMins }));
  }, [navigatingTo, userLocation, dispatch, map, currentRoute]);

  return null;
}
