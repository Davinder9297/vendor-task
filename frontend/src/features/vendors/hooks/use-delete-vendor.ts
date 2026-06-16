import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../api/vendors.api';

export const useDeleteVendor = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => vendorsApi.deleteVendor(companyId, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
    },
  });
};
