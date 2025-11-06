import apiClient from './axios';

export interface Review {
  review_id: number;
  user: number;
  station: number;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  user_email?: string;
  station_name?: string;
}

export const reviewsApi = {
  getReviews: async (stationId?: number): Promise<Review[]> => {
    const params = stationId ? { station_id: stationId } : {};
    const response = await apiClient.get<Review[]>('/reviews/', { params });
    return response.data;
  },

  createReview: async (data: { station: number; rating: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews/', data);
    return response.data;
  },
};

