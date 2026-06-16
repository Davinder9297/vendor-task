import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../api/vendors.api';
import { VendorFormValues } from '../validation/vendor.schema';

export const useUpdateVendor = (companyId: string, vendorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<VendorFormValues>) =>
      vendorsApi.updateVendor(companyId, vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', companyId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', companyId, vendorId] });
    },
  });
};
