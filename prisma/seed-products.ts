import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting product seeding...');

  // First, ensure we have a vendor and categories
  let vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    console.log('Creating default vendor...');
    vendor = await prisma.vendor.create({
      data: {
        name: 'Plutex Demo Store',
        email: 'vendor@plutex.com',
        phone: '+260 XXX XXX XXX',
        address: 'Cairo Road',
        city: 'Lusaka',
        state: 'Lusaka Province',
        zipCode: '10101',
        country: 'Zambia',
        description: 'Official Plutex demonstration store',
        status: 'ACTIVE',
        isVerified: true,
      },
    });
  }

  // Create categories if they don't exist
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home decor and garden supplies',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        slug: 'sports',
        description: 'Sports equipment and outdoor gear',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: {
        name: 'Books',
        slug: 'books',
        description: 'Books and educational materials',
        isActive: true,
      },
    }),
  ]);

  console.log('Categories created/updated');

  // Products data with real Unsplash images
  const productsData = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
      price: 299.99,
      stockQuantity: 50,
      categoryId: categories[0].id,
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop',
      ],
      brand: 'AudioTech',
      sku: 'WBH-001',
      isActive: true,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 128,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 7-day battery life. Stay connected and healthy.',
      price: 449.99,
      stockQuantity: 35,
      categoryId: categories[0].id, // Electronics
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop',
      ],
      brand: 'TechWear',
      sku: 'SWP-002',
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 95,
    },
    {
      name: 'Laptop Backpack',
      description: 'Durable and stylish backpack with padded laptop compartment (fits up to 15.6"), multiple pockets, and water-resistant material.',
      price: 79.99,
      stockQuantity: 100,
      categoryId: categories[0].id, // Electronics
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop',
      ],
      brand: 'TravelGear',
      sku: 'LBP-003',
      isActive: true,
      isFeatured: true,
      rating: 4.3,
      reviewCount: 67,
    },
    {
      name: 'Men\'s Casual T-Shirt',
      description: '100% cotton comfortable t-shirt, available in multiple colors. Perfect for everyday wear with a modern fit.',
      price: 24.99,
      stockQuantity: 200,
      categoryId: categories[1].id, // Fashion
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop',
      ],
      brand: 'StyleCo',
      sku: 'MCT-004',
      isActive: true,
      rating: 4.2,
      reviewCount: 203,
    },
    {
      name: 'Women\'s Running Shoes',
      description: 'Lightweight running shoes with excellent cushioning and support. Breathable mesh upper and durable rubber sole.',
      price: 89.99,
      stockQuantity: 75,
      categoryId: categories[3].id, // Sports
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop',
      ],
      brand: 'RunFast',
      sku: 'WRS-005',
      isActive: true,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 142,
    },
    {
      name: 'Coffee Maker Deluxe',
      description: 'Programmable coffee maker with 12-cup capacity, auto-brew feature, and keep-warm function. Start your day right!',
      price: 129.99,
      stockQuantity: 40,
      categoryId: categories[2].id, // Home & Garden
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
      ],
      brand: 'BrewMaster',
      sku: 'CMD-006',
      isActive: true,
      isFeatured: true,
      rating: 4.4,
      reviewCount: 88,
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Extra thick (6mm) non-slip yoga mat with carrying strap. Perfect for yoga, pilates, and floor exercises.',
      price: 39.99,
      stockQuantity: 150,
      categoryId: categories[3].id, // Sports
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
      ],
      brand: 'ZenFit',
      sku: 'YMP-007',
      isActive: true,
      rating: 4.8,
      reviewCount: 156,
    },
    {
      name: 'Desk Lamp LED',
      description: 'Modern LED desk lamp with adjustable brightness, flexible arm, and USB charging port. Energy-efficient and stylish.',
      price: 49.99,
      stockQuantity: 80,
      categoryId: categories[2].id, // Home & Garden
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop',
      ],
      brand: 'LightWorks',
      sku: 'DLL-008',
      isActive: true,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 74,
    },
    {
      name: 'Bestseller Novel Collection',
      description: 'Set of 3 bestselling novels from award-winning authors. Perfect for book lovers and gift-giving.',
      price: 59.99,
      stockQuantity: 60,
      categoryId: categories[4].id, // Books
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
      ],
      brand: 'BookWorld',
      sku: 'BNC-009',
      isActive: true,
      rating: 4.9,
      reviewCount: 312,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with silent clicks, adjustable DPI, and long battery life. Compatible with all devices.',
      price: 29.99,
      stockQuantity: 120,
      categoryId: categories[0].id, // Electronics
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop',
      ],
      brand: 'TechGear',
      sku: 'WM-010',
      isActive: true,
      isFeatured: true,
      rating: 4.4,
      reviewCount: 189,
    },
    {
      name: 'Sunglasses Classic',
      description: 'UV400 protection sunglasses with polarized lenses. Timeless design suitable for any occasion.',
      price: 69.99,
      stockQuantity: 90,
      categoryId: categories[1].id, // Fashion
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop',
      ],
      brand: 'SunStyle',
      sku: 'SC-011',
      isActive: true,
      rating: 4.3,
      reviewCount: 76,
    },
    {
      name: 'Indoor Plant Pot Set',
      description: 'Set of 3 ceramic plant pots with drainage holes and saucers. Perfect for succulents and small plants.',
      price: 34.99,
      stockQuantity: 110,
      categoryId: categories[2].id, // Home & Garden
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&auto=format&fit=crop',
      ],
      brand: 'GreenHome',
      sku: 'IPP-012',
      isActive: true,
      rating: 4.6,
      reviewCount: 94,
    },
    {
      name: 'Portable Bluetooth Speaker',
      description: 'Waterproof portable speaker with 360° sound, 12-hour battery, and built-in microphone. Perfect for outdoor adventures.',
      price: 79.99,
      stockQuantity: 65,
      categoryId: categories[0].id, // Electronics
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop',
      ],
      brand: 'SoundWave',
      sku: 'PBS-013',
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 167,
    },
    {
      name: 'Dumbbell Set',
      description: 'Adjustable dumbbell set (5-25 lbs per hand) with anti-slip grip. Complete home gym solution.',
      price: 149.99,
      stockQuantity: 45,
      categoryId: categories[3].id, // Sports
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
      ],
      brand: 'FitPro',
      sku: 'DS-014',
      isActive: true,
      rating: 4.5,
      reviewCount: 103,
    },
    {
      name: 'Canvas Wall Art',
      description: 'Modern abstract canvas wall art (24x36 inches). Ready to hang with premium quality print.',
      price: 89.99,
      stockQuantity: 55,
      categoryId: categories[2].id, // Home & Garden
      vendorId: vendor.id,
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop',
      ],
      brand: 'ArtHouse',
      sku: 'CWA-015',
      isActive: true,
      rating: 4.8,
      reviewCount: 58,
    },
  ];

  // Create products
  console.log('Creating products...');
  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: productData,
    });
    console.log(`Created: ${product.name}`);
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`Created ${productsData.length} products`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
