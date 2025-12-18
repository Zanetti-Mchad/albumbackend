const axios = require('axios');
const API_BASE_URL = 'http://localhost:4210/api/v1';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Test login with email
    console.log('\n1. Testing login with email...');
    const emailLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@gmail.com',
      password: 'password@123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email login successful!');
    const emailToken = emailLogin.data.accessToken 
      || emailLogin.headers?.['x-access-token'] 
      || (emailLogin.headers?.['authorization'] ? emailLogin.headers['authorization'].replace('Bearer ', '') : undefined);
    console.log('User data:', {
      id: emailLogin.data.data.user.id,
      name: emailLogin.data.data.user.name,
      email: emailLogin.data.data.user.email,
      role: emailLogin.data.data.user.role,
      token: emailToken ? '***token-received***' : 'no-token'
    });

    // Test login with email (using identifier field)
    console.log('\n2. Testing login with identifier (email)...');
    const identifierLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: 'admin@familyalbum.com',
      password: 'Admin@1234'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Identifier login successful!');
    const identifierToken = identifierLogin.data.accessToken 
      || identifierLogin.headers?.['x-access-token'] 
      || (identifierLogin.headers?.['authorization'] ? identifierLogin.headers['authorization'].replace('Bearer ', '') : undefined);
    console.log('User data:', {
      id: identifierLogin.data.data.user.id,
      name: identifierLogin.data.data.user.name,
      email: identifierLogin.data.data.user.email,
      role: identifierLogin.data.data.user.role,
      token: identifierToken ? '***token-received***' : 'no-token'
    });

    // Test getting user profile with the token
    console.log('\n3. Testing user profile with the token...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${emailToken}`
      }
    });
    
    console.log('✅ Profile retrieval successful!');
    console.log('Profile data:', {
      id: profileResponse.data.data.id,
      name: profileResponse.data.data.name,
      email: profileResponse.data.data.email,
      role: profileResponse.data.data.role,
      isActive: profileResponse.data.data.isActive
    });

    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    process.exit(1);
  }
}

testAdminLogin();
