import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VendorCategory } from '../constants/vendor-category.enum';
import { VendorStatus } from '../constants/vendor-status.enum';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, type: String })
  companyId: string;

  @Prop({ required: true, type: String, minlength: 2, maxlength: 80 })
  name: string;

  @Prop({ type: String, index: true, sparse: true })
  email?: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ required: true, type: String, enum: VendorCategory })
  category: VendorCategory;

  @Prop({
    required: true,
    type: String,
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @Prop({ type: String, maxlength: 500 })
  notes?: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ required: true, type: Number, default: 1 })
  schemaVersion: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Add indexes
VendorSchema.index({ companyId: 1, status: 1, createdAt: -1 });
VendorSchema.index({ companyId: 1, isDeleted: 1 });
VendorSchema.index(
  { companyId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: { $eq: false },
      email: { $exists: true },
    },
  },
);
