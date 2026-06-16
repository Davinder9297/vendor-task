import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VendorFormValues } from '../validation/vendor.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { VendorCategory, VendorStatus, Vendor } from '../types/vendor.types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

function getCategoryLabel(category: VendorCategory): string {
  const labels: Record<VendorCategory, string> = {
    [VendorCategory.SERVICE_PROVIDER]: 'Service Provider',
    [VendorCategory.SOFTWARE]: 'Software',
    [VendorCategory.RENT]: 'Rent',
    [VendorCategory.FINANCE]: 'Finance',
    [VendorCategory.OTHER]: 'Other',
  };
  return labels[category] || category;
}

interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (data: VendorFormValues) => void;
  isSubmitting: boolean;
  companyId: string;
}

export function VendorForm({ initialData, onSubmit, isSubmitting, companyId }: VendorFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email || '',
          phone: initialData.phone || '',
          category: initialData.category,
          status: initialData.status,
          notes: initialData.notes || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          category: VendorCategory.OTHER,
          status: VendorStatus.ACTIVE,
          notes: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">Vendor Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter vendor name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter vendor email"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter vendor phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-foreground">Category *</Label>
          <Select id="category" {...register('category')} className={errors.category ? 'border-destructive' : ''}>
            {Object.values(VendorCategory).map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive flex items-center">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
          <Select id="status" {...register('status')}>
            {Object.values(VendorStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-foreground">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Enter any additional notes about the vendor"
          rows={4}
          className={errors.notes ? 'border-destructive' : ''}
        />
        {errors.notes && (
          <p className="text-sm text-destructive flex items-center">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? 'Update Vendor' : 'Create Vendor'}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/companies/${companyId}/vendors`)}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </span>
        </Button>
      </div>
    </form>
  );
}
