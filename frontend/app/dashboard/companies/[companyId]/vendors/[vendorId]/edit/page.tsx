'use client';

import { useParams, useRouter } from 'next/navigation';
import { VendorForm } from '@/features/vendors/components/vendor-form';
import { useVendor } from '@/features/vendors/hooks/use-vendors';
import { useUpdateVendor } from '@/features/vendors/hooks/use-update-vendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/features/vendors/api/vendors.api';
import { VendorFormValues } from '@/features/vendors/validation/vendor.schema';
import { UseFormSetError } from 'react-hook-form';

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const vendorId = params.vendorId as string;
  const { data: vendor, isLoading, isError } = useVendor(companyId, vendorId);
  const updateMutation = useUpdateVendor(companyId, vendorId);
  const { addToast } = useToast();

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Vendor Not Found</h2>
            <p className="text-muted-foreground mb-6">The vendor you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Link href={`/dashboard/companies/${companyId}/vendors`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vendors
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (data: VendorFormValues, setError: UseFormSetError<VendorFormValues>) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Vendor updated!',
          message: 'Vendor information has been updated successfully.',
        });
        router.push(`/dashboard/companies/${companyId}/vendors`);
      },
      onError: (error: unknown) => {
        const apiError = error as ApiError;
        if (apiError.fields && Array.isArray(apiError.fields)) {
          apiError.fields.forEach((fieldErr) => {
            setError(fieldErr.path as Parameters<typeof setError>[0], {
              type: 'manual',
              message: fieldErr.message,
            });
          });
        }
        addToast({
          type: 'error',
          title: 'Failed to update vendor',
          message: apiError.message,
        });
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href={`/dashboard/companies/${companyId}/vendors`}>
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-3xl w-full">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Edit Vendor</CardTitle>
            <p className="text-muted-foreground mt-2">Update vendor information</p>
          </CardHeader>
          <CardContent>
            <VendorForm
              initialData={vendor}
              companyId={companyId}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
