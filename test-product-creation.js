#!/usr/bin/env node

/**
 * Test script to demonstrate product creation with proper logging
 * This script tests product creation with valid and invalid vendor/category references
 */

// Use the native fetch in Node.js 20+, fallback to node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:3002';
const PRODUCTS_URL = `${BASE_URL}/api/products`;

// Test cases for product creation
const testCases = [
  {
    name: 'Valid Product Creation',
    data: {
      name: 'iPhone 15 Pro Max',
      description: 'Latest Apple iPhone with advanced features',
      price: 1199.99,
      originalPrice: 1299.99,
      brand: 'Apple',
      vendorId: 'cmffgrip8000cvhfq33tige9l', // TechStore Pro
      categoryId: 'cmffgrin30000vhfq3j2arbil', // Electronics
      stockQuantity: 50,
      availability: 'IN_STOCK',
      isActive: true,
      isFeatured: true,
      images: ['https://via.placeholder.com/400x400?text=iPhone+15+Pro'],
      specifications: {
        display: '6.7-inch Super Retina XDR',
        camera: '48MP Main + 12MP Ultra Wide',
        storage: '256GB',
        processor: 'A17 Pro chip'
      },
      sku: 'IPHONE15PM-256',
      weight: 221,
      dimensions: '6.33 x 3.02 x 0.32 inches'
    },
    description: 'Test with valid vendor and category IDs'
  },
  {
    name: 'Invalid Vendor ID Test',
    data: {
      name: 'Samsung Galaxy S24',
      description: 'Latest Samsung smartphone',
      price: 999.99,
      brand: 'Samsung',
      vendorId: 'invalid_vendor_id_12345',
      categoryId: 'cmffgrin30000vhfq3j2arbil', // Electronics
      stockQuantity: 30
    },
    description: 'Test with invalid vendor ID'
  },
  {
    name: 'Invalid Category ID Test', 
    data: {
      name: 'MacBook Pro',
      description: 'Apple laptop computer',
      price: 2499.99,
      brand: 'Apple',
      vendorId: 'cmffgrip8000cvhfq33tige9l', // TechStore Pro
      categoryId: 'invalid_category_id_67890',
      stockQuantity: 15
    },
    description: 'Test with invalid category ID'
  },
  {
    name: 'Missing Required Fields Test',
    data: {
      name: 'Product Without Vendor',
      description: 'This should fail',
      price: 99.99,
      brand: 'Test Brand'
      // Missing vendorId and categoryId
    },
    description: 'Test with missing required fields'
  }
];

async function testProductCreation(testCase) {
  console.log(`\n🧪 Running: ${testCase.name}`);
  console.log(`📝 ${testCase.description}`);
  console.log(`📦 Product: ${testCase.data.name}`);
  console.log(`💰 Price: $${testCase.data.price}`);
  console.log(`🏢 Vendor ID: ${testCase.data.vendorId || '[MISSING]'}`);
  console.log(`📂 Category ID: ${testCase.data.categoryId || '[MISSING]'}`);
  
  try {
    const response = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Product-Test-Script/1.0'
      },
      body: JSON.stringify(testCase.data)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS (${response.status})`);
      console.log(`🆔 Product ID: ${responseData.id}`);
      console.log(`📦 Product Name: ${responseData.name}`);
      console.log(`🏢 Vendor: ${responseData.vendor?.name || '[Unknown]'}`);
      console.log(`📂 Category: ${responseData.category?.name || '[Unknown]'}`);
      console.log(`📦 Stock: ${responseData.stockQuantity}`);
    } else {
      console.log(`❌ FAILED (${response.status})`);
      console.log(`⚠️  Error: ${responseData.message || 'Unknown error'}`);
      if (responseData.error) {
        console.log(`🔍 Details: ${responseData.error}`);
      }
    }
    
  } catch (error) {
    console.log(`💥 REQUEST ERROR: ${error.message}`);
  }
  
  console.log('─'.repeat(80));
}

async function runTests() {
  console.log('🚀 Starting Product Creation Tests');
  console.log(`🎯 Target: ${PRODUCTS_URL}`);
  console.log('='.repeat(80));
  
  // Check if backend is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api`);
    if (healthCheck.ok) {
      console.log('✅ Backend appears to be running');
    } else {
      throw new Error('Backend not accessible');
    }
  } catch (error) {
    console.log('❌ Backend might not be running. Make sure to start it with: npm run start:dev');
    console.log(`🌐 Expected backend URL: ${BASE_URL}`);
    console.log(`🔍 Error: ${error.message}`);
    return;
  }
  
  // First, get current vendors and categories for reference
  try {
    console.log('\n📋 Fetching current vendors and categories...');
    
    const vendorsResponse = await fetch(`${BASE_URL}/api/vendors`);
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    
    if (vendorsResponse.ok && categoriesResponse.ok) {
      const vendors = await vendorsResponse.json();
      const categories = await categoriesResponse.json();
      
      console.log('\n🏢 Available Vendors:');
      vendors.forEach(vendor => {
        console.log(`  • ${vendor.name}: ${vendor.id} (${vendor.status})`);
      });
      
      console.log('\n📂 Available Categories:');
      categories.forEach(category => {
        console.log(`  • ${category.name}: ${category.id}`);
      });
    }
  } catch (error) {
    console.log('⚠️  Could not fetch vendors/categories for reference');
  }
  
  // Run test cases sequentially
  for (const testCase of testCases) {
    await testProductCreation(testCase);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n🎉 Product creation tests completed!');
  console.log('\n📋 To view the detailed logs:');
  console.log('1. Check your backend console output');
  console.log('2. Look for log entries with [ProductsService]');
  console.log('3. Debug logs show validation steps and database operations');
  console.log('4. Each request has a unique ID for tracing');
  console.log('\n📊 Database Validation:');
  console.log('- Foreign key constraints are validated before creation');
  console.log('- Vendor and category existence is checked');
  console.log('- Detailed error messages help identify issues');
  console.log('- Successful creations include full product details');
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧪 Product Creation Test Script

Usage: node test-product-creation.js [options]

Options:
  --help, -h    Show this help message

Description:
  This script tests the product creation endpoint to demonstrate the logging
  and validation system for handling vendor and category foreign key relationships.

Prerequisites:
  1. Backend must be running (npm run start:dev)
  2. Database must be seeded with vendors and categories
  3. Backend should be accessible at ${BASE_URL}

What this script tests:
  - Valid product creation with proper vendor/category IDs
  - Invalid vendor ID handling
  - Invalid category ID handling  
  - Missing required fields validation

The logging system will capture:
  - Product validation steps (vendor/category checks)
  - Database query attempts and results
  - Foreign key constraint validation
  - Successful product creation details
  - Error handling with specific error codes
  - Performance metrics for each operation

Each request gets a unique ID for easy tracing across all log entries.
`);
  process.exit(0);
}

// Run the tests
runTests().catch(console.error);