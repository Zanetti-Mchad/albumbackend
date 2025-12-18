const axios = require('axios');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = 'http://localhost:4210/api/v1';
const TEST_EMAIL = 'admin@familyalbum.com';
const NEW_PASSWORD = 'NewSecure@1234';

async function testPasswordReset() {
  try {
    console.log('=== Testing Password Reset Flow ===');
    
    // Step 1: Request password reset
    console.log('\n1. Requesting password reset...');
    const resetRequest = await axios.post(
      `${API_BASE_URL}/auth/request-password-reset`,
      { identifier: TEST_EMAIL },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('✅ Password reset request successful');
    console.log('Response:', JSON.stringify(resetRequest.data, null, 2));
    
    // Step 2: Get OTP and new password from user
    console.log('\nPlease check your email/console for the OTP and enter it below:');
    
    readline.question('Enter the OTP you received: ', (otp) => {
      readline.question('Enter your new password: ', { hideEchoBack: true }, async (newPassword) => {
        readline.question('Confirm your new password: ', { hideEchoBack: true }, async (confirmPassword) => {
          if (newPassword !== confirmPassword) {
            console.error('❌ Passwords do not match!');
            readline.close();
            return;
          }

          try {
            // Step 3: Reset password with OTP and new password
            console.log('\n2. Resetting password with OTP...');
            const resetResponse = await axios.post(
              `${API_BASE_URL}/auth/reset-password`,
              {
                token: otp.trim(),
                newPassword: newPassword,
                confirmPassword: confirmPassword
              },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
            console.log('✅ Password reset successful!');
            console.log('Response:', JSON.stringify(resetResponse.data, null, 2));
            
            // Step 4: Test login with new password
            console.log('\n3. Testing login with new password...');
            const loginResponse = await axios.post(
              `${API_BASE_URL}/auth/login`,
              {
                email: TEST_EMAIL,
                password: newPassword
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            console.log('✅ Login with new password successful!');
            console.log('User data:', {
              id: loginResponse.data.data.user.id,
              name: loginResponse.data.data.user.name,
              email: loginResponse.data.data.user.email,
              role: loginResponse.data.data.user.role
            });
          } catch (error) {
            console.error('❌ Error during password reset or login:', error.response?.data || error.message);
          } finally {
            readline.close();
          }
        });
      });
        
      
    });
    
  } catch (error) {
    console.error('❌ Error in password reset flow:', error.response?.data || error.message);
    readline.close();
  }
}

testPasswordReset();
