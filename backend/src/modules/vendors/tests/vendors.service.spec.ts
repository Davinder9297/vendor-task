import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { VendorsService } from '../vendors.service';
import { Vendor, VendorSchema } from '../schemas/vendor.schema';
import { VendorCategory } from '../constants/vendor-category.enum';
import { VendorStatus } from '../constants/vendor-status.enum';

describe('VendorsService', () => {
  let service: VendorsService;
  let module: TestingModule;
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let vendorModel: Model<Vendor>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
  });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: getModelToken(Vendor.name),
          useFactory: (conn: Connection) =>
            conn.model(Vendor.name, VendorSchema),
          inject: [Connection],
        },
        {
          provide: Connection,
          useFactory: () => {
            const conn = mongoose.createConnection(mongod.getUri());
            return conn;
          },
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    connection = module.get<Connection>(Connection);
    vendorModel = module.get<Model<Vendor>>(getModelToken(Vendor.name));
  });

  afterEach(async () => {
    await vendorModel.deleteMany({});
    await connection.close();
  });

  afterAll(async () => {
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a vendor successfully', async () => {
    const vendor = await service.create('company1', {
      name: 'Test Vendor',
      category: VendorCategory.SOFTWARE,
      status: VendorStatus.ACTIVE,
    });

    expect(vendor).toBeDefined();
    expect(vendor.name).toBe('Test Vendor');
  });

  it('should reject duplicate email in same company', async () => {
    await service.create('company1', {
      name: 'Test Vendor 1',
      email: 'test@example.com',
      category: VendorCategory.SOFTWARE,
    });

    await expect(
      service.create('company1', {
        name: 'Test Vendor 2',
        email: 'test@example.com',
        category: VendorCategory.SOFTWARE,
      }),
    ).rejects.toThrow();
  });

  it('should allow same email in different company', async () => {
    const vendor1 = await service.create('company1', {
      name: 'Test Vendor 1',
      email: 'test@example.com',
      category: VendorCategory.SOFTWARE,
    });
    const vendor2 = await service.create('company2', {
      name: 'Test Vendor 2',
      email: 'test@example.com',
      category: VendorCategory.SOFTWARE,
    });

    expect(vendor1).toBeDefined();
    expect(vendor2).toBeDefined();
  });

  it('should list vendors by company', async () => {
    await service.create('company1', {
      name: 'Vendor 1',
      category: VendorCategory.SOFTWARE,
    });
    await service.create('company1', {
      name: 'Vendor 2',
      category: VendorCategory.SOFTWARE,
    });
    await service.create('company2', {
      name: 'Vendor 3',
      category: VendorCategory.SOFTWARE,
    });

    const result = await service.findAll('company1', {});
    expect(result.vendors.length).toBe(2);
  });

  it('should not list soft-deleted vendors', async () => {
    const vendor = await service.create('company1', {
      name: 'Test Vendor',
      category: VendorCategory.SOFTWARE,
    });
    await service.remove('company1', vendor.id);

    const result = await service.findAll('company1', {});
    expect(result.vendors.length).toBe(0);
  });

  it('should return 404 when vendor belongs to another company', async () => {
    const vendor = await service.create('company1', {
      name: 'Test Vendor',
      category: VendorCategory.SOFTWARE,
    });
    await expect(service.findOne('company2', vendor.id)).rejects.toThrow();
  });

  it('should update vendor successfully', async () => {
    const vendor = await service.create('company1', {
      name: 'Old Name',
      category: VendorCategory.SOFTWARE,
    });
    const updated = await service.update('company1', vendor.id, {
      name: 'New Name',
    });
    expect(updated.name).toBe('New Name');
  });

  it('should soft delete vendor successfully', async () => {
    const vendor = await service.create('company1', {
      name: 'Test Vendor',
      category: VendorCategory.SOFTWARE,
    });
    await service.remove('company1', vendor.id);

    const found = await vendorModel.findById(vendor.id);
    expect(found?.isDeleted).toBe(true);
    expect(found?.deletedAt).toBeInstanceOf(Date);
  });
});
