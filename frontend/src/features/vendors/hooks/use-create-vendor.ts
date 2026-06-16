import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../api/vendors.api';
import { VendorFormValues } from '../validation/vendor.schema';

export const useCreateVendor = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorFormValues) => vendorsApi.createVendor(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
    },
  });
};
