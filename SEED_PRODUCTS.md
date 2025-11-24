# Product Seeding Guide

## Overview
This script seeds the database with 15 high-quality products across 5 categories, complete with real images from Unsplash.

## Products Included

### Electronics (5 products)
1. **Wireless Bluetooth Headphones** - K299.99
2. **Smart Watch Pro** - K449.99
3. **Laptop Backpack** - K79.99
4. **Wireless Mouse** - K29.99
5. **Portable Bluetooth Speaker** - K79.99

### Fashion (2 products)
6. **Men's Casual T-Shirt** - K24.99
7. **Sunglasses Classic** - K69.99

### Home & Garden (4 products)
8. **Coffee Maker Deluxe** - K129.99
9. **Desk Lamp LED** - K49.99
10. **Indoor Plant Pot Set** - K34.99
11. **Canvas Wall Art** - K89.99

### Sports & Outdoors (3 products)
12. **Women's Running Shoes** - K89.99
13. **Yoga Mat Premium** - K39.99
14. **Dumbbell Set** - K149.99

### Books (1 product)
15. **Bestseller Novel Collection** - K59.99

## How to Run

### Option 1: Using npm script
```bash
cd plutex-backend
npm run seed:products
```

### Option 2: Using ts-node directly
```bash
cd plutex-backend
npx ts-node prisma/seed-products.ts
```

### Option 3: Using Prisma seed
```bash
cd plutex-backend
npx prisma db seed
```

## What Gets Created

1. **Vendor** - A demo vendor if none exists
2. **Categories** - 5 categories (Electronics, Fashion, Home & Garden, Sports, Books)
3. **Products** - 15 products with:
   - Name and description
   - Price and stock
   - 2 high-quality images each (from Unsplash)
   - Brand and SKU
   - Category assignment

## Features

- ✅ **Real Images** - All products have 2 professional images from Unsplash
- ✅ **Detailed Descriptions** - Each product has a comprehensive description
- ✅ **Stock Management** - Realistic stock quantities (35-200 units)
- ✅ **Pricing** - Varied pricing from K24.99 to K449.99
- ✅ **Categories** - Products distributed across 5 categories
- ✅ **Brands** - Each product has a brand name
- ✅ **SKUs** - Unique SKU for each product
- ✅ **Upsert Logic** - Safe to run multiple times (won't create duplicates)

## Database Requirements

Make sure your database is set up and migrations are run:

```bash
npx prisma migrate dev
```

## Verification

After seeding, verify the products:

```bash
# Check products in database
npx prisma studio

# Or query via API
curl http://localhost:3002/api/products
```

## Troubleshooting

### Error: Vendor not found
The script automatically creates a demo vendor if none exists.

### Error: Category not found
The script creates all required categories automatically.

### Error: Duplicate slug
The script uses upsert, so it will update existing products instead of creating duplicates.

### Images not loading
The images are hosted on Unsplash CDN. Make sure you have internet connectivity.

## Customization

To add more products, edit `prisma/seed-products.ts` and add to the `productsData` array:

```typescript
{
  name: 'Your Product Name',
  slug: 'your-product-slug',
  description: 'Product description',
  price: 99.99,
  stock: 50,
  categoryId: categories[0].id,
  vendorId: vendor.id,
  images: [
    'https://images.unsplash.com/photo-xxxxx',
    'https://images.unsplash.com/photo-yyyyy',
  ],
  brand: 'Brand Name',
  sku: 'SKU-001',
  isActive: true,
}
```

## Image Sources

All images are from Unsplash (https://unsplash.com) with proper attribution and licensing for commercial use.

## Next Steps

After seeding:
1. Start the backend server: `npm run start:dev`
2. Visit the shop: `http://localhost:3000/shop`
3. Browse the products with real images!

## Clean Up

To remove all seeded products:

```sql
-- In Prisma Studio or your database client
DELETE FROM products WHERE vendor_id = 'demo-vendor-id';
```

Or reset the entire database:

```bash
npx prisma migrate reset
```

---

**Note**: This seed script is safe to run multiple times. It uses upsert operations to prevent duplicates.
