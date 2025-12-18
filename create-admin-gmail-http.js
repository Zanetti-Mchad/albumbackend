const axios = require('axios');
const API_BASE_URL = 'http://localhost:4210/api/v1';

async function createAdminUser() {
  try {
    const adminData = {
      firstName: 'Admin',
      lastName: 'Gmail',
      email: 'admin@gmail.com',
      phone: '0700000000',
      password: 'password@123',
      role: 'admin',
      phoneNumber: '0700000000'
    };

    console.log('Creating admin user (admin@gmail.com)...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, adminData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error creating admin user:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

createAdminUser();


