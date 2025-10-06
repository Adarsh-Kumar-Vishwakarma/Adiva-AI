import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123'
};

const testLogin = {
  email: 'test@example.com',
  password: 'TestPass123'
};

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
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

    // Test 2: Login user
    console.log('2️⃣ Testing user login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLogin)
    });

    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginData);
    console.log('');

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      
      // Test 3: Get user profile (requires authentication)
      console.log('3️⃣ Testing get user profile...');
      const profileResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.data.token}`
        }
      });

      const profileData = await profileResponse.json();
      console.log('Profile Status:', profileResponse.status);
      console.log('Profile Response:', profileData);
      console.log('');

      if (profileResponse.status === 200) {
        console.log('✅ Profile fetch successful!');
      } else {
        console.log('❌ Profile fetch failed');
      }

      // Test 4: Logout user
      console.log('4️⃣ Testing user logout...');
      const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.data.token}`
        }
      });

      const logoutData = await logoutResponse.json();
      console.log('Logout Status:', logoutResponse.status);
      console.log('Logout Response:', logoutData);
      console.log('');

      if (logoutResponse.status === 200) {
        console.log('✅ Logout successful!');
      } else {
        console.log('❌ Logout failed');
      }
    } else {
      console.log('❌ Login failed');
    }

    // Test 5: Test invalid login
    console.log('5️⃣ Testing invalid login...');
    const invalidLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });

    const invalidLoginData = await invalidLoginResponse.json();
    console.log('Invalid Login Status:', invalidLoginResponse.status);
    console.log('Invalid Login Response:', invalidLoginData);
    console.log('');

    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid login correctly rejected!');
    } else {
      console.log('❌ Invalid login not properly handled');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run the tests
testAuth();
