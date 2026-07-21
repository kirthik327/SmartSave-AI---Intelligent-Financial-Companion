

const baseUrl = 'https://smartsave-backend-nxm0.onrender.com';
const randomId = Math.floor(Math.random() * 9000) + 1000;
const email = `testuser_${randomId}@smartsave.ai`;
const password = 'Password123';

const runTest = async () => {
  console.log(`Testing Email: ${email}`);
  
  // 1. Signup Request
  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password })
  });
  
  const signupData = await signupResponse.json();
  console.log('Signup Status:', signupResponse.status);
  console.log('Signup Response:', signupData);
  
  if (signupResponse.status !== 201) {
    console.error('Signup failed!');
    return;
  }
  
  // 2. Login Request
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login Status:', loginResponse.status);
  console.log('Login Response:', loginData);
};

runTest().catch(console.error);
