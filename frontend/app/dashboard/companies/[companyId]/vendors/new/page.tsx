'use client';

import { useParams, useRouter } from 'next/navigation';
import { VendorForm } from '@/features/vendors/components/vendor-form';
import { useCreateVendor } from '@/features/vendors/hooks/use-create-vendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/features/vendors/api/vendors.api';

export default function CreateVendorPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const createMutation = useCreateVendor(companyId);
  const { addToast } = useToast();

  const handleSubmit = (data: any, setError: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Vendor created!',
          message: 'Your new vendor has been added to the directory.',
        });
        router.push(`/dashboard/companies/${companyId}/vendors`);
      },
      onError: (error: unknown) => {
        const apiError = error as ApiError;
        if (apiError.fields && Array.isArray(apiError.fields)) {
          apiError.fields.forEach((fieldErr) => {
            setError(fieldErr.path, {
              type: 'manual',
              message: fieldErr.message,
            });
          });
        }
        addToast({
          type: 'error',
          title: 'Failed to create vendor',
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
            <CardTitle className="text-2xl">Create New Vendor</CardTitle>
            <p className="text-muted-foreground mt-2">Add a new vendor to your directory</p>
          </CardHeader>
          <CardContent>
            <VendorForm
              companyId={companyId}
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
