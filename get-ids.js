const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getIds() {
  console.log('📋 Getting vendor and category IDs...\n');
  
  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
      status: true,
    }
  });
  
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    }
  });

  console.log('🏢 VENDORS:');
  vendors.forEach(vendor => {
    console.log(`  ${vendor.name}: ${vendor.id} (${vendor.status})`);
  });

  console.log('\n📦 CATEGORIES:');
  categories.forEach(category => {
    console.log(`  ${category.name}: ${category.id}`);
  });

  console.log('\n🔧 Example product creation data:');
  if (vendors.length > 0 && categories.length > 0) {
    console.log(`{
  "name": "Sample Product",
  "description": "A great product",
  "price": 99.99,
  "brand": "Sample Brand",
  "vendorId": "${vendors[0].id}",
  "categoryId": "${categories[0].id}",
  "stockQuantity": 10
}`);
  }

  await prisma.$disconnect();
}

getIds().catch(console.error);