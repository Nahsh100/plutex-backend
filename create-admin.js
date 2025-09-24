const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@admin.com',
        password: hashedPassword,
        phone: '+1234567890',
        address: '123 Admin Street',
        city: 'Admin City',
        state: 'AS',
        zipCode: '12345',
        country: 'United States',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔐 Password: admin123');
    console.log('👤 Role: ADMIN');

    // Also create a vendor user for testing vendor features
    const vendorPassword = await bcrypt.hash('vendor123', 10);

    const vendor = await prisma.user.create({
      data: {
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: vendorPassword,
        phone: '+1234567891',
        address: '456 Vendor Street',
        city: 'Vendor City',
        state: 'VS',
        zipCode: '67890',
        country: 'United States',
        role: 'VENDOR',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Vendor user created successfully!');
    console.log('📧 Email: vendor@test.com');
    console.log('🔐 Password: vendor123');
    console.log('👤 Role: VENDOR');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();