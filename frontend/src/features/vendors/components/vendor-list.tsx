import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Vendor, VendorStatus, VendorCategory, SortField, SortOrder } from '../types/vendor.types';
import { VendorStatusBadge } from './vendor-status-badge';
import { DeleteVendorDialog } from './delete-vendor-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit2, Search, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useDeleteVendor } from '../hooks/use-delete-vendor';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '../api/vendors.api';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';
import { Pagination } from '@/components/ui/pagination';

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

interface VendorListProps {
  vendors: Vendor[];
  isLoading: boolean;
  isError: boolean;
  companyId: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  currentPage: number;
  totalPages: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export function VendorList({
  vendors,
  isLoading,
  isError,
  companyId,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onSortChange,
  currentPage,
  totalPages,
  sortBy,
  sortOrder,
}: VendorListProps) {
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const deleteMutation = useDeleteVendor(companyId);
  const { addToast } = useToast();
  
  // Debounce search input
  const debouncedSearch = useCallback(
    (value: string) => {
      onSearchChange(value);
    },
    [onSearchChange]
  );

  const handleDelete = () => {
    if (deleteVendorId) {
      deleteMutation.mutate(deleteVendorId, {
        onSuccess: () => {
          setDeleteVendorId(null);
          addToast({
            type: 'success',
            title: 'Vendor deleted!',
            message: 'The vendor has been removed from your directory.',
          });
        },
        onError: (error: unknown) => {
          const apiError = error as ApiError;
          addToast({
            type: 'error',
            title: 'Failed to delete vendor',
            message: apiError.message,
          });
        },
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default order
      onSortChange(field, 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">All Status</option>
          {Object.values(VendorStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-2xl">Vendors</CardTitle>
            <Link href={`/dashboard/companies/${companyId}/vendors/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <SortIcon field="name" />
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <SortIcon field="email" />
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('phone')}
                  >
                    Phone
                    <SortIcon field="phone" />
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('category')}
                  >
                    Category
                    <SortIcon field="category" />
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <SortIcon field="status" />
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                    <SortIcon field="createdAt" />
                  </th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader size="md" />
                      <p className="mt-2 text-muted-foreground">Loading vendors...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-destructive">
                      Error loading vendors. Please try again.
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
                      <p className="text-muted-foreground mb-6">Create your first vendor to get started!</p>
                      <Link href={`/dashboard/companies/${companyId}/vendors/new`}>
                        <Button size="lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Vendor
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{vendor.name}</td>
                      <td className="py-4 px-6 text-muted-foreground">{vendor.email || '-'}</td>
                      <td className="py-4 px-6 text-muted-foreground">{vendor.phone || '-'}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                          {getCategoryLabel(vendor.category)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <VendorStatusBadge status={vendor.status} />
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/companies/${companyId}/vendors/${vendor.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteVendorId(vendor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteVendorDialog
        open={!!deleteVendorId}
        onOpenChange={(open) => !open && setDeleteVendorId(null)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
