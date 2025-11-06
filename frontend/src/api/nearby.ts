import apiClient from './axios';

export interface NearbyStation {
  station_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  price_per_unit?: number;
  is_available: boolean;
  distance_km: number;
  avg_rating: number;
}

export const nearbyApi = {
  getNearbyStations: async (
    lat: number,
    lon: number,
    radiusKm: number = 10,
    fuelTypeId: number
  ): Promise<NearbyStation[]> => {
    const response = await apiClient.get<NearbyStation[]>('/nearby/', {
      params: {
        lat,
        lon,
        radius_km: radiusKm,
        fuel_type_id: fuelTypeId,
      },
    });
    return response.data;
  },
};

