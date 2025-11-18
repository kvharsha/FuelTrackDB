import type { Station } from '../api/stations';

/**
 * Simple fuzzy search without external dependencies
 * Scores based on:
 * - Exact match
 * - Starts with query
 * - Contains query
 * - Word boundary matches
 */
export interface SearchResult {
  station: Station;
  score: number;
}

export function fuzzySearch(stations: Station[], query: string): Station[] {
  if (!query.trim()) {
    return stations;
  }

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  const results: SearchResult[] = stations.map(station => {
    let score = 0;
    const searchableText = `${station.name} ${station.address} ${station.city} ${station.state}`.toLowerCase();

    // Exact match
    if (searchableText === lowerQuery) {
      score += 1000;
    }

    // Starts with query
    if (searchableText.startsWith(lowerQuery)) {
      score += 500;
    }

    // Contains query
    if (searchableText.includes(lowerQuery)) {
      score += 100;
    }

    // Word boundary matches
    for (const word of queryWords) {
      if (searchableText.includes(word)) {
        score += 50;
      }
      
      // Word starts with query word
      const words = searchableText.split(/\s+/);
      for (const textWord of words) {
        if (textWord.startsWith(word)) {
          score += 30;
        }
      }
    }

    // Name match gets bonus
    if (station.name.toLowerCase().includes(lowerQuery)) {
      score += 200;
    }

    // City match gets bonus
    if (station.city.toLowerCase().includes(lowerQuery)) {
      score += 150;
    }

    return { station, score };
  });

  // Filter out zero scores and sort by score
  return results
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.station);
}

