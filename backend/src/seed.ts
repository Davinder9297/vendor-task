import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor } from './modules/vendors/schemas/vendor.schema';
import { VendorCategory } from './modules/vendors/constants/vendor-category.enum';
import { VendorStatus } from './modules/vendors/constants/vendor-status.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vendorModel = app.get<Model<Vendor>>(getModelToken(Vendor.name));

  // Clear existing data
  await vendorModel.deleteMany({});

  const companyId = 'demo-company-1';

  const demoVendors = [
    {
      companyId,
      name: 'Internet Provider Co',
      email: 'contact@internetprovider.com',
      phone: '123-456-7890',
      category: VendorCategory.SERVICE_PROVIDER,
      status: VendorStatus.ACTIVE,
      notes: 'Main internet provider for office',
      schemaVersion: 1,
    },
    {
      companyId,
      name: 'Office Rent Owner',
      email: 'rent@officerent.com',
      phone: '987-654-3210',
      category: VendorCategory.RENT,
      status: VendorStatus.ACTIVE,
      notes: 'Monthly office rent payment',
      schemaVersion: 1,
    },
    {
      companyId,
      name: 'Laptop Repair Vendor',
      category: VendorCategory.SERVICE_PROVIDER,
      status: VendorStatus.ACTIVE,
      notes: 'IT repair services',
      schemaVersion: 1,
    },
    {
      companyId,
      name: 'Accounting Services Inc',
      email: 'accounting@accountingservices.com',
      category: VendorCategory.FINANCE,
      status: VendorStatus.ACTIVE,
      notes: 'Tax and accounting services',
      schemaVersion: 1,
    },
    {
      companyId,
      name: 'Software Subscription Pro',
      email: 'support@softwaresub.com',
      phone: '555-123-4567',
      category: VendorCategory.SOFTWARE,
      status: VendorStatus.INACTIVE,
      notes: 'Old software subscription',
      schemaVersion: 1,
    },
  ];

  await vendorModel.insertMany(demoVendors);

  console.log('✅ Seed data created successfully!');
  console.log(`📊 ${demoVendors.length} vendors added for company: ${companyId}`);

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Error seeding data:', err);
  process.exit(1);
});
