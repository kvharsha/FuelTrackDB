import apiClient from './axios';

export interface Favorite {
  user: number;
  station: number;
  created_at: string;
  station_name?: string;
  station_address?: string;
  station_latitude?: number;
  station_longitude?: number;
}

export const favoritesApi = {
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get<Favorite[]>('/favorites/');
    return response.data;
  },

  addFavorite: async (stationId: number): Promise<Favorite> => {
    const response = await apiClient.post<Favorite>('/favorites/', { station_id: stationId });
    return response.data;
  },

  removeFavorite: async (stationId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${stationId}/`);
  },
};

