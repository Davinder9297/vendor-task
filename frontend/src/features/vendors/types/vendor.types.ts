export enum VendorCategory {
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  SOFTWARE = 'SOFTWARE',
  RENT = 'RENT',
  FINANCE = 'FINANCE',
  OTHER = 'OTHER',
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type SortField = 'name' | 'email' | 'phone' | 'category' | 'status' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  category: VendorCategory;
  status: VendorStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface ListVendorsResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
