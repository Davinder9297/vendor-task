import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dtos/create-vendor.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
import { ListVendorsQueryDto } from './dtos/list-vendors-query.dto';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('api/v1/companies/:companyId/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(
    @Param('companyId') companyId: string,
    @Body() createVendorDto: CreateVendorDto,
  ): Promise<ApiResponse> {
    const vendor = await this.vendorsService.create(companyId, createVendorDto);
    return ResponseHelper.success(vendor);
  }

  @Get()
  async findAll(
    @Param('companyId') companyId: string,
    @Query() query: ListVendorsQueryDto,
  ): Promise<ApiResponse> {
    const result = await this.vendorsService.findAll(companyId, query);
    return ResponseHelper.success(result);
  }

  @Get(':vendorId')
  async findOne(
    @Param('companyId') companyId: string,
    @Param('vendorId') vendorId: string,
  ): Promise<ApiResponse> {
    const vendor = await this.vendorsService.findOne(companyId, vendorId);
    return ResponseHelper.success(vendor);
  }

  @Patch(':vendorId')
  async update(
    @Param('companyId') companyId: string,
    @Param('vendorId') vendorId: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<ApiResponse> {
    const vendor = await this.vendorsService.update(
      companyId,
      vendorId,
      updateVendorDto,
    );
    return ResponseHelper.success(vendor);
  }

  @Delete(':vendorId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('companyId') companyId: string,
    @Param('vendorId') vendorId: string,
  ): Promise<ApiResponse> {
    await this.vendorsService.remove(companyId, vendorId);
    return ResponseHelper.success(null);
  }
}
