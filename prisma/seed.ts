import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
    slug: 'electronics',
    image: 'https://via.placeholder.com/300x200?text=Electronics',
    metaTitle: 'Electronics - Latest Gadgets and Devices',
    metaDescription: 'Discover the latest electronic devices, smartphones, laptops, and gadgets',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Clothing & Fashion',
    description: 'Trendy clothing and fashion accessories',
    slug: 'clothing-fashion',
    image: 'https://via.placeholder.com/300x200?text=Clothing',
    metaTitle: 'Clothing & Fashion - Trendy Apparel',
    metaDescription: 'Shop the latest fashion trends, clothing, and accessories',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    slug: 'home-garden',
    image: 'https://via.placeholder.com/300x200?text=Home+Garden',
    metaTitle: 'Home & Garden - Decorate Your Space',
    metaDescription: 'Transform your home and garden with our collection of furniture and decor',
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    slug: 'sports-outdoors',
    image: 'https://via.placeholder.com/300x200?text=Sports',
    metaTitle: 'Sports & Outdoors - Active Lifestyle',
    metaDescription: 'Get active with our sports equipment and outdoor gear',
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
  },
  {
    name: 'Books & Media',
    description: 'Books, movies, music, and digital media',
    slug: 'books-media',
    image: 'https://via.placeholder.com/300x200?text=Books+Media',
    metaTitle: 'Books & Media - Entertainment Collection',
    metaDescription: 'Explore books, movies, music, and digital entertainment',
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
  },
  {
    name: 'Health & Beauty',
    description: 'Health products and beauty essentials',
    slug: 'health-beauty',
    image: 'https://via.placeholder.com/300x200?text=Health+Beauty',
    metaTitle: 'Health & Beauty - Wellness Products',
    metaDescription: 'Take care of your health and beauty with our premium products',
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
  },
  {
    name: 'Toys & Games',
    description: 'Fun toys and games for all ages',
    slug: 'toys-games',
    image: 'https://via.placeholder.com/300x200?text=Toys+Games',
    metaTitle: 'Toys & Games - Entertainment for All Ages',
    metaDescription: 'Find the perfect toys and games for children and adults',
    isActive: true,
    isFeatured: false,
    sortOrder: 7,
  },
  {
    name: 'Automotive',
    description: 'Car parts, accessories, and automotive supplies',
    slug: 'automotive',
    image: 'https://via.placeholder.com/300x200?text=Automotive',
    metaTitle: 'Automotive - Car Parts and Accessories',
    metaDescription: 'Quality automotive parts, accessories, and maintenance supplies',
    isActive: true,
    isFeatured: false,
    sortOrder: 8,
  },
  {
    name: 'Pet Supplies',
    description: 'Everything your pets need',
    slug: 'pet-supplies',
    image: 'https://via.placeholder.com/300x200?text=Pet+Supplies',
    metaTitle: 'Pet Supplies - Care for Your Pets',
    metaDescription: 'Quality pet food, toys, and supplies for all types of pets',
    isActive: true,
    isFeatured: false,
    sortOrder: 9,
  },
  {
    name: 'Office & Business',
    description: 'Office supplies and business essentials',
    slug: 'office-business',
    image: 'https://via.placeholder.com/300x200?text=Office+Business',
    metaTitle: 'Office & Business - Professional Supplies',
    metaDescription: 'Professional office supplies and business equipment',
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
  },
  {
    name: 'Jewelry & Watches',
    description: 'Elegant jewelry and luxury timepieces',
    slug: 'jewelry-watches',
    image: 'https://via.placeholder.com/300x200?text=Jewelry+Watches',
    metaTitle: 'Jewelry & Watches - Luxury Accessories',
    metaDescription: 'Discover elegant jewelry and luxury watches',
    isActive: true,
    isFeatured: false,
    sortOrder: 11,
  },
  {
    name: 'Food & Beverages',
    description: 'Quality food and beverage products',
    slug: 'food-beverages',
    image: 'https://via.placeholder.com/300x200?text=Food+Beverages',
    metaTitle: 'Food & Beverages - Quality Products',
    metaDescription: 'Premium food and beverage products for your table',
    isActive: true,
    isFeatured: false,
    sortOrder: 12,
  },
];

const vendors = [
  {
    name: 'TechStore Pro',
    email: 'contact@techstorepro.com',
    phone: '+1-555-0123',
    address: '123 Tech Street',
    city: 'Silicon Valley',
    state: 'CA',
    zipCode: '94000',
    country: 'USA',
    description: 'Leading provider of cutting-edge technology products',
    logo: 'https://via.placeholder.com/150x150?text=TechStore',
    website: 'https://techstorepro.com',
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    name: 'Fashion Forward',
    email: 'hello@fashionforward.com',
    phone: '+1-555-0124',
    address: '456 Fashion Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    description: 'Trendy fashion and lifestyle products',
    logo: 'https://via.placeholder.com/150x150?text=Fashion',
    website: 'https://fashionforward.com',
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    name: 'Home & Garden Co',
    email: 'info@homegarden.com',
    phone: '+1-555-0125',
    address: '789 Garden Way',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA',
    description: 'Everything you need for your home and garden',
    logo: 'https://via.placeholder.com/150x150?text=HomeGarden',
    website: 'https://homegarden.com',
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    name: 'Sports Central',
    email: 'support@sportscentral.com',
    phone: '+1-555-0126',
    address: '321 Athletic Blvd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    country: 'USA',
    description: 'Premium sports equipment and outdoor gear',
    logo: 'https://via.placeholder.com/150x150?text=Sports',
    website: 'https://sportscentral.com',
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    name: 'Beauty Essentials',
    email: 'contact@beautyessentials.com',
    phone: '+1-555-0127',
    address: '654 Beauty Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
    description: 'Premium health and beauty products',
    logo: 'https://via.placeholder.com/150x150?text=Beauty',
    website: 'https://beautyessentials.com',
    status: 'ACTIVE',
    isVerified: true,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  console.log('📝 Seeding categories...');
  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  // Seed vendors
  console.log('📝 Seeding vendors...');
  for (const vendor of vendors) {
    await prisma.vendor.create({
      data: {
        ...vendor,
        status: vendor.status as any,
      },
    });
    console.log(`✅ Created vendor: ${vendor.name}`);
  }

  // Create AppConfig for global commission rate
  console.log('📝 Creating app configuration...');
  await prisma.appConfig.create({
    data: {
      commissionRate: 0.1, // 10% default commission
      taxRate: 0.15, // 15% default tax rate
    },
  });
  console.log('✅ Created app configuration with 10% commission rate and 15% tax rate');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${categories.length} categories, ${vendors.length} vendors, and app configuration`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
