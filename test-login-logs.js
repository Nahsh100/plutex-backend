#!/usr/bin/env node

/**
 * Test script to demonstrate login request/response logging
 * This script sends HTTP requests to the backend login endpoint to showcase the logging functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port
const LOGIN_URL = `${BASE_URL}/auth/login`;

// Test cases with different scenarios
const testCases = [
  {
    name: 'Valid Login Test',
    email: 'test@example.com',
    password: 'testpassword123',
    description: 'Test with potentially valid credentials'
  },
  {
    name: 'Invalid Email Test',
    email: 'nonexistent@example.com', 
    password: 'wrongpassword',
    description: 'Test with non-existent email'
  },
  {
    name: 'Invalid Password Test',
    email: 'test@example.com',
    password: 'wrongpassword',
    description: 'Test with valid email but wrong password'
  },
  {
    name: 'Empty Credentials Test',
    email: '',
    password: '',
    description: 'Test with empty credentials'
  }
];

async function testLogin(testCase) {
  console.log(`\n🔍 Running: ${testCase.name}`);
  console.log(`📝 ${testCase.description}`);
  console.log(`📧 Email: ${testCase.email}`);
  console.log(`🔑 Password: ${testCase.password ? '[PROVIDED]' : '[EMPTY]'}`);
  
  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Login-Test-Script/1.0'
      },
      body: JSON.stringify({
        email: testCase.email,
        password: testCase.password
      })
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS (${response.status})`);
      console.log(`👤 User: ${responseData.user?.name} (${responseData.user?.email})`);
      console.log(`🎫 Access Token: ${responseData.accessToken ? '[PROVIDED]' : '[MISSING]'}`);
      console.log(`🔄 Refresh Token: ${responseData.refreshToken ? '[PROVIDED]' : '[MISSING]'}`);
    } else {
      console.log(`❌ FAILED (${response.status})`);
      console.log(`⚠️  Error: ${responseData.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`💥 REQUEST ERROR: ${error.message}`);
  }
  
  console.log('─'.repeat(60));
}

async function runTests() {
  console.log('🚀 Starting Login Logging Tests');
  console.log(`🎯 Target: ${LOGIN_URL}`);
  console.log('='.repeat(60));
  
  // Check if backend is running
  try {
    const healthCheck = await fetch(BASE_URL);
    console.log('✅ Backend appears to be running');
  } catch (error) {
    console.log('❌ Backend might not be running. Make sure to start it with: npm run start:dev');
    console.log(`🌐 Expected backend URL: ${BASE_URL}`);
    return;
  }
  
  // Run test cases sequentially
  for (const testCase of testCases) {
    await testLogin(testCase);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Test completed!');
  console.log('\n📋 To view the detailed logs:');
  console.log('1. Check your backend console output');
  console.log('2. Look for log entries with [AuthController] and [AuthService]');
  console.log('3. Debug logs show detailed request/response information');
  console.log('4. Each request has a unique ID for tracing');
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔍 Login Logging Test Script

Usage: node test-login-logs.js [options]

Options:
  --help, -h    Show this help message

Description:
  This script tests the login endpoint to demonstrate the comprehensive logging
  that has been added to the authentication system.

Prerequisites:
  1. Backend must be running (npm run start:dev)
  2. Database must be set up with test users
  3. Backend should be accessible at ${BASE_URL}

What this script tests:
  - Valid login attempts
  - Invalid email scenarios  
  - Invalid password scenarios
  - Empty credential handling

The logging system will capture:
  - Incoming requests with IP, User-Agent, and request details
  - User lookup attempts and results
  - Password verification attempts
  - Token generation processes
  - Response preparation and sending
  - Error handling and stack traces
  - Performance metrics (request duration)

Each request gets a unique ID for easy tracing across all log entries.
`);
  process.exit(0);
}

// Run the tests
runTests().catch(console.error);