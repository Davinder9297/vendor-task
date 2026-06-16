import { VendorStatus } from '../types/vendor.types';
import { cn } from '@/lib/utils';

interface VendorStatusBadgeProps {
  status: VendorStatus;
}

export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
  const isActive = status === VendorStatus.ACTIVE;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        isActive ? 'bg-green-500' : 'bg-yellow-500'
      )} />
      {status}
    </span>
  );
}
