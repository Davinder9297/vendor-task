import { z } from 'zod';
import { VendorCategory, VendorStatus } from '../types/vendor.types';

export const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  category: z.nativeEnum(VendorCategory),
  status: z.nativeEnum(VendorStatus).optional().default(VendorStatus.ACTIVE),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional().or(z.literal('')),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
