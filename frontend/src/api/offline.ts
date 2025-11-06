import apiClient from './axios';

export interface OfflinePackage {
  package_id: number;
  user: number;
  name: string;
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
  created_at: string;
  expires_at?: string;
  size_bytes?: number;
}

export const offlineApi = {
  getPackages: async (): Promise<OfflinePackage[]> => {
    const response = await apiClient.get<OfflinePackage[]>('/offline-packages/');
    return response.data;
  },

  createPackage: async (data: {
    name: string;
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
    expires_at?: string;
  }): Promise<OfflinePackage> => {
    const response = await apiClient.post<OfflinePackage>('/offline-packages/', data);
    return response.data;
  },

  deletePackage: async (packageId: number): Promise<void> => {
    await apiClient.delete(`/offline-packages/${packageId}/`);
  },
};

