import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { BaseException } from './../src/common/exceptions/base.exception';
import { VendorCategory } from './../src/modules/vendors/constants/vendor-category.enum';
import { VendorStatus } from './../src/modules/vendors/constants/vendor-status.enum';

describe('VendorsController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const fields = errors.map((err) => {
            let message = 'Invalid value';
            if (err.constraints) {
              message = Object.values(err.constraints).join(', ');
            }
            return {
              path: err.property,
              message,
            };
          });
          return new BaseException(
            'VALIDATION_ERROR',
            'One or more fields are invalid',
            400,
            fields,
          );
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    const conn = app.get<Connection>(getConnectionToken());
    await conn.collection('vendors').deleteMany({});
    await app.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('Create vendor successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'Valid Vendor',
        email: 'valid@example.com',
        category: VendorCategory.SOFTWARE,
        status: VendorStatus.ACTIVE,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Valid Vendor');
    expect(response.body.data.email).toBe('valid@example.com');
  });

  it('Invalid payload returns 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'A',
        category: 'INVALID_CATEGORY',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields).toBeInstanceOf(Array);
    
    const nameField = response.body.error.fields.find((f: any) => f.path === 'name');
    const categoryField = response.body.error.fields.find((f: any) => f.path === 'category');
    expect(nameField).toBeDefined();
    expect(categoryField).toBeDefined();
  });

  it('Duplicate email returns 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'Vendor 1',
        email: 'dup@example.com',
        category: VendorCategory.SOFTWARE,
      });

    const response = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'Vendor 2',
        email: 'DUP@EXAMPLE.COM',
        category: VendorCategory.SOFTWARE,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VENDOR_DUPLICATE_EMAIL');
    expect(response.body.error.fields).toEqual([
      { path: 'email', message: 'Already exists' }
    ]);
  });

  it('Wrong company access returns 404', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/companies/company-a/vendors')
      .send({
        name: 'Vendor A',
        category: VendorCategory.SOFTWARE,
      });

    const vendorId = createRes.body.data.id;

    const response = await request(app.getHttpServer())
      .get(`/api/v1/companies/company-b/vendors/${vendorId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VENDOR_NOT_FOUND');
  });

  it('Deleted vendor does not appear in list', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'To Delete',
        category: VendorCategory.SOFTWARE,
      });

    const vendorId = createRes.body.data.id;

    await request(app.getHttpServer())
      .delete(`/api/v1/companies/demo-company/vendors/${vendorId}`);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/companies/demo-company/vendors');

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.vendors.length).toBe(0);
    expect(listRes.body.data.total).toBe(0);
  });

  it('Unknown fields are rejected', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'ABC Vendor',
        category: VendorCategory.SOFTWARE,
        isAdmin: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(response.body.error.fields)).toContain('isAdmin');
  });

  it('Update vendor works', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'Original Name',
        category: VendorCategory.SOFTWARE,
      });

    const vendorId = createRes.body.data.id;

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/companies/demo-company/vendors/${vendorId}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Name');
  });

  it('Delete vendor works', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/companies/demo-company/vendors')
      .send({
        name: 'To Delete',
        category: VendorCategory.SOFTWARE,
      });

    const vendorId = createRes.body.data.id;

    const response = await request(app.getHttpServer())
      .delete(`/api/v1/companies/demo-company/vendors/${vendorId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
