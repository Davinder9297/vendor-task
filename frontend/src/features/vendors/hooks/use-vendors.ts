import { useQuery } from '@tanstack/react-query';
import { vendorsApi } from '../api/vendors.api';
import { SortField, SortOrder } from '../types/vendor.types';

export const useVendors = (
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
  return useQuery({
    queryKey: ['vendors', companyId, params],
    queryFn: () => vendorsApi.getVendors(companyId, params),
  });
};

export const useVendor = (companyId: string, vendorId: string) => {
  return useQuery({
    queryKey: ['vendor', companyId, vendorId],
    queryFn: () => vendorsApi.getVendor(companyId, vendorId),
  });
};
