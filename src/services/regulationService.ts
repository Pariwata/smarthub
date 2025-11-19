import { apiService } from './api';
import { RegulationRequest } from '../types/regulation';
import { ApiResponse } from '../types/api';

export const regulationService = {
  async submitRequest(request: RegulationRequest): Promise<ApiResponse<RegulationRequest>> {
    try {
      const { template, ...requestData } = request;

      // If template file exists, use upload endpoint
      if (template) {
        return await apiService.uploadFile<RegulationRequest>(
          '/regulations/requests',
          template,
          requestData
        );
      }

      // Otherwise, send as JSON
      return await apiService.post<RegulationRequest>('/regulations/requests', requestData);
    } catch (error) {
      console.error('Error submitting regulation request:', error);
      throw error;
    }
  },

  async getRequests(): Promise<ApiResponse<RegulationRequest[]>> {
    try {
      return await apiService.get<RegulationRequest[]>('/regulations/requests');
    } catch (error) {
      console.error('Error fetching regulation requests:', error);
      throw error;
    }
  },

  async getRequestById(id: string): Promise<ApiResponse<RegulationRequest>> {
    try {
      return await apiService.get<RegulationRequest>(`/regulations/requests/${id}`);
    } catch (error) {
      console.error('Error fetching regulation request:', error);
      throw error;
    }
  },

  async updateRequest(id: string, request: Partial<RegulationRequest>): Promise<ApiResponse<RegulationRequest>> {
    try {
      return await apiService.put<RegulationRequest>(`/regulations/requests/${id}`, request);
    } catch (error) {
      console.error('Error updating regulation request:', error);
      throw error;
    }
  },

  async deleteRequest(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/regulations/requests/${id}`);
    } catch (error) {
      console.error('Error deleting regulation request:', error);
      throw error;
    }
  },
};
