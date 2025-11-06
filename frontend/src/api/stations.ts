import apiClient from './axios';

export interface Station {
  station_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  status: 'Operational' | 'Under Construction' | 'Closed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  operator?: number;
}

export interface FuelType {
  fuel_type_id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface StationFuel {
  station: number;
  fuel_type: number;
  price_per_unit?: number;
  is_available: boolean;
  last_price_update?: string;
  updated_at: string;
  station_name?: string;
  fuel_type_name?: string;
}

export const stationsApi = {
  getStations: async (): Promise<Station[]> => {
    const response = await apiClient.get<Station[]>('/stations/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  getStation: async (id: number): Promise<Station> => {
    const response = await apiClient.get<Station>(`/stations/${id}/`);
    return response.data;
  },

  getFuelTypes: async (): Promise<FuelType[]> => {
    const response = await apiClient.get<FuelType[]>('/fuel_types/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  getStationFuels: async (): Promise<StationFuel[]> => {
    const response = await apiClient.get<StationFuel[]>('/station_fuels/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  getStationFuelsByStation: async (stationId: number): Promise<StationFuel[]> => {
    const response = await apiClient.get<StationFuel[]>(`/station_fuels/?station=${stationId}`);
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },
};

