export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param a First point
 * @param b Second point
 * @returns Distance in kilometers
 */
export function km(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  
  const a_val =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(a_val), Math.sqrt(1 - a_val));
  
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Helper to convert [lat, lng] tuple to LatLng object
 */
export function tupleToLatLng(tuple: [number, number]): LatLng {
  return { lat: tuple[0], lng: tuple[1] };
}

