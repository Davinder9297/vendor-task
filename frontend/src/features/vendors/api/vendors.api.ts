import { Vendor, ListVendorsResponse, ApiResponse, SortField, SortOrder } from '../types/vendor.types';
import { VendorFormValues } from '../validation/vendor.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      const error = new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An error occurred',
        data.error?.fields as any,
      );
      throw error;
    }

    return data.data as T;
  } catch (fetchError) {
    if (fetchError instanceof ApiError) {
      throw fetchError;
    }
    if (fetchError instanceof Error) {
      throw new ApiError(
        'NETWORK_ERROR',
        fetchError.message || 'Network error occurred',
      );
    }
    throw new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
  }
}

export const vendorsApi = {
  getVendors: async (
    companyId: string,
    params?: { 
      search?: string; 
      status?: string; 
      page?: number; 
      limit?: number;
      sortBy?: SortField;
      sortOrder?: SortOrder;
    },
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    return fetchApi<ListVendorsResponse>(
      `/companies/${companyId}/vendors?${searchParams.toString()}`,
    );
  },

  getVendor: async (companyId: string, vendorId: string) => {
    return fetchApi<Vendor>(`/companies/${companyId}/vendors/${vendorId}`);
  },

  createVendor: async (companyId: string, data: VendorFormValues) => {
    return fetchApi<Vendor>(`/companies/${companyId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVendor: async (companyId: string, vendorId: string, data: Partial<VendorFormValues>) => {
    return fetchApi<Vendor>(`/companies/${companyId}/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteVendor: async (companyId: string, vendorId: string) => {
    return fetchApi<void>(`/companies/${companyId}/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  },
};
