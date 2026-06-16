import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dtos/create-vendor.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
import { ListVendorsQueryDto } from './dtos/list-vendors-query.dto';
import { VendorMapper, VendorResponse } from './mappers/vendor.mapper';
import { BaseException } from '../../common/exceptions/base.exception';
import { VendorErrorCodes } from './constants/vendor-error-codes';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(
    companyId: string,
    createVendorDto: CreateVendorDto,
  ): Promise<VendorResponse> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const vendor = new this.vendorModel({
        companyId,
        ...createVendorDto,
      });

      await vendor.save({ session });
      await session.commitTransaction();
      return VendorMapper.toResponse(vendor);
    } catch (error: unknown) {
      await session.abortTransaction();
      console.error('Error in create vendor:', error);
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        console.log('Throwing duplicate email error');
        throw new BaseException(
          VendorErrorCodes.VENDOR_DUPLICATE_EMAIL,
          'Vendor with this email already exists for this company',
          409,
          { email: 'Already exists' },
        );
      }
      throw error;
    } finally {
      session.endSession();
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
      isDeleted: { $eq: false },
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
      isDeleted: { $eq: false },
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
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const vendor = await this.vendorModel
        .findOne({
          _id: vendorId,
          companyId,
          isDeleted: { $eq: false },
        })
        .session(session);

      if (!vendor) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_NOT_FOUND,
          'Vendor not found',
          404,
        );
      }

      Object.assign(vendor, updateVendorDto);
      await vendor.save({ session });
      await session.commitTransaction();
      return VendorMapper.toResponse(vendor);
    } catch (error: unknown) {
      await session.abortTransaction();
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
          { email: 'Already exists' },
        );
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async remove(companyId: string, vendorId: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const vendor = await this.vendorModel
        .findOne({
          _id: vendorId,
          companyId,
          isDeleted: { $eq: false },
        })
        .session(session);

      if (!vendor) {
        throw new BaseException(
          VendorErrorCodes.VENDOR_NOT_FOUND,
          'Vendor not found',
          404,
        );
      }

      vendor.isDeleted = true;
      await vendor.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
