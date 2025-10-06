import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthResponse.status);
    console.log('Health Response:', healthData);
    console.log('');

    // Test 2: Test auth register endpoint
    console.log('2️⃣ Testing auth register endpoint...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register Status:', registerResponse.status);
    console.log('Register Response:', registerData);
    console.log('');

    if (registerResponse.status === 201) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run the tests
testAuth();
