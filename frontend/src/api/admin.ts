import apiClient from './axios';
import type { Station, FuelType, StationFuel } from './stations';

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  phone?: string;
}

export const adminApi = {
  getUsers: async (search?: string): Promise<User[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get<User[]>('/users/', { params });
    return response.data;
  },

  toggleUserBlock: async (userId: number): Promise<{ user_id: number; is_active: boolean; message: string }> => {
    const response = await apiClient.post(`/users/${userId}/toggle-block/`);
    return response.data;
  },

  createStation: async (data: Partial<Station>): Promise<Station> => {
    const response = await apiClient.post<Station>('/stations/', data);
    return response.data;
  },

  updateStation: async (id: number, data: Partial<Station>): Promise<Station> => {
    const response = await apiClient.put<Station>(`/stations/${id}/`, data);
    return response.data;
  },

  deleteStation: async (id: number): Promise<void> => {
    await apiClient.delete(`/stations/${id}/`);
  },

  createFuelType: async (data: Partial<FuelType>): Promise<FuelType> => {
    const response = await apiClient.post<FuelType>('/fuel_types/', data);
    return response.data;
  },

  updateFuelType: async (id: number, data: Partial<FuelType>): Promise<FuelType> => {
    const response = await apiClient.put<FuelType>(`/fuel_types/${id}/`, data);
    return response.data;
  },

  deleteFuelType: async (id: number): Promise<void> => {
    await apiClient.delete(`/fuel_types/${id}/`);
  },

  createStationFuel: async (data: Partial<StationFuel>): Promise<StationFuel> => {
    const response = await apiClient.post<StationFuel>('/station_fuels/', data);
    return response.data;
  },

  updateStationFuel: async (stationId: number, fuelTypeId: number, data: Partial<StationFuel>): Promise<StationFuel> => {
    // Note: This assumes a composite key endpoint; adjust based on your actual API
    const response = await apiClient.put<StationFuel>(`/station_fuels/${stationId}-${fuelTypeId}/`, data);
    return response.data;
  },
};

