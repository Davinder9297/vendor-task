import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { VendorCategory } from '../constants/vendor-category.enum';
import { VendorStatus } from '../constants/vendor-status.enum';

export class CreateVendorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(VendorCategory)
  category: VendorCategory;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
