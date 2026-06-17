import { VendorDocument } from '../schemas/vendor.schema';
import { Types } from 'mongoose';

export interface VendorResponse {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  category: string;
  status: string;
  notes?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  schemaVersion: number;
}

export class VendorMapper {
  static toResponse(vendor: VendorDocument): VendorResponse {
    return {
      id: vendor._id.toString(),
      companyId: vendor.companyId,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      status: vendor.status,
      notes: vendor.notes,
      isDeleted: vendor.isDeleted,
      deletedAt: vendor.deletedAt ?? null,
      deletedById: vendor.deletedById ?? null,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      schemaVersion: vendor.schemaVersion,
    };
  }

  static toResponseList(vendors: VendorDocument[]): VendorResponse[] {
    return vendors.map((vendor) => this.toResponse(vendor));
  }
}
