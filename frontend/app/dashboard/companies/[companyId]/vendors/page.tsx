'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { VendorList } from '@/features/vendors/components/vendor-list';
import { useVendors } from '@/features/vendors/hooks/use-vendors';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SortField, SortOrder } from '@/features/vendors/types/vendor.types';
import { debounce } from '@/lib/utils';

export default function VendorsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Debounce search changes
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
        setPage(1); // Reset to first page when search changes
      }, 300),
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1); // Reset to first page when status changes
  }, []);

  const handleSortChange = useCallback((newSortBy: SortField, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sort changes
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const { data, isLoading, isError } = useVendors(companyId, {
    search: debouncedSearch,
    status,
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>
      <VendorList
        vendors={data?.vendors || []}
        isLoading={isLoading}
        isError={isError}
        companyId={companyId}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        currentPage={page}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
