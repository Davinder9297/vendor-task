import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dtos/create-vendor.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
import { ListVendorsQueryDto } from './dtos/list-vendors-query.dto';
import { VendorMapper, VendorResponse } from './mappers/vendor.mapper';
import { BaseException } from '../../common/exceptions/base.exception';
import { VendorErrorCodes } from './constants/vendor-error-codes';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  async create(
    companyId: string,
    createVendorDto: CreateVendorDto,
  ): Promise<VendorResponse> {
    // Trim and lowercase email if provided
    if (createVendorDto.email) {
      createVendorDto.email = createVendorDto.email.trim().toLowerCase();
    }

    // Explicit check for duplicate email within the same company (case-insensitive)
    if (createVendorDto.email) {
      const existing = await this.vendorModel.findOne({
        companyId,
        email: createVendorDto.email,
        deletedAt: null,
      });

      if (existing) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_DUPLICATE_EMAIL,
          'Vendor with this email already exists for this company',
          409,
          [{ path: 'email', message: 'Already exists' }],
        );
      }
    }

    try {
      const vendor = new this.vendorModel({
        companyId,
        ...createVendorDto,
      });

      await vendor.save();
      return VendorMapper.toResponse(vendor);
    } catch (error: unknown) {
      this.logger.error(`Error in create vendor: ${error instanceof Error ? error.message : error}`);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_DUPLICATE_EMAIL,
          'Vendor with this email already exists for this company',
          409,
          [{ path: 'email', message: 'Already exists' }],
        );
      }
      throw error;
    }
  }

  async findAll(
    companyId: string,
    query: ListVendorsQueryDto,
  ): Promise<{
    vendors: VendorResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: any = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    // Define sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [vendors, total] = await Promise.all([
      this.vendorModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.vendorModel.countDocuments(filter),
    ]);

    return {
      vendors: VendorMapper.toResponseList(vendors),
      total,
      page,
      limit,
    };
  }

  async findOne(companyId: string, vendorId: string): Promise<VendorResponse> {
    const vendor = await this.vendorModel.findOne({
      _id: vendorId,
      companyId,
      deletedAt: null,
    });

    if (!vendor) {
      throw new BaseException(
        VendorErrorCodes.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }

    return VendorMapper.toResponse(vendor);
  }

  async update(
    companyId: string,
    vendorId: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<VendorResponse> {
    const vendor = await this.vendorModel.findOne({
      _id: vendorId,
      companyId,
      deletedAt: null,
    });

    if (!vendor) {
      throw new BaseException(
        VendorErrorCodes.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }

    // Trim and lowercase email if provided
    if (updateVendorDto.email) {
      updateVendorDto.email = updateVendorDto.email.trim().toLowerCase();
    }

    // Explicit check for duplicate email within the same company (case-insensitive)
    if (updateVendorDto.email) {
      const existing = await this.vendorModel.findOne({
        companyId,
        email: updateVendorDto.email,
        deletedAt: null,
        _id: { $ne: vendorId },
      });

      if (existing) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_DUPLICATE_EMAIL,
          'Vendor with this email already exists for this company',
          409,
          [{ path: 'email', message: 'Already exists' }],
        );
      }
    }

    try {
      Object.assign(vendor, updateVendorDto);
      await vendor.save();
      return VendorMapper.toResponse(vendor);
    } catch (error: unknown) {
      this.logger.error(`Error in update vendor: ${error instanceof Error ? error.message : error}`);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_DUPLICATE_EMAIL,
          'Vendor with this email already exists for this company',
          409,
          [{ path: 'email', message: 'Already exists' }],
        );
      }
      throw error;
    }
  }

  async remove(companyId: string, vendorId: string): Promise<void> {
    const vendor = await this.vendorModel.findOne({
      _id: vendorId,
      companyId,
      deletedAt: null,
    });

    if (!vendor) {
      throw new BaseException(
        VendorErrorCodes.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }

    vendor.isDeleted = true;
    vendor.deletedAt = new Date();
    vendor.deletedById = null;
    await vendor.save();
  }
}
