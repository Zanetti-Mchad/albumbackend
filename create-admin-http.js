const axios = require('axios');
const API_BASE_URL = 'http://localhost:4210/api/v1';

async function createAdminUser() {
  try {
    const adminData = {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@familyalbum.com',
      phone: '0782651854',
      password: 'Admin@1234',
      role: 'admin',
      phoneNumber: '0782651854' // Adding phoneNumber as it might be required
    };

    console.log('Creating admin user...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, adminData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\nYou can now login with:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Phone: ${adminData.phone}`);
    console.log('Password: Admin@1234');
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:');
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

createAdminUser();
