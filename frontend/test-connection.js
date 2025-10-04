// Frontend-Backend Connection Test
// Run this in the browser console on your frontend page

console.log('🔍 Testing Frontend-Backend Connection...');

// Test 1: Check if API base URL is correct
console.log('📍 API Base URL:', window.location.origin);
console.log('📍 Expected Backend URL: http://localhost:3000');

// Test 2: Test health endpoint
fetch('http://localhost:3000/health')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Health Check:', data);
    })
    .catch(error => {
        console.error('❌ Health Check Failed:', error);
    });

// Test 3: Test login (if not already logged in)
fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'admin@company.com',
        password: 'admin123'
    })
})
    .then(response => response.json())
    .then(data => {
        console.log('✅ Login Test:', data);

        if (data.success && data.data.token) {
            const token = data.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Test 4: Test categories endpoint with auth
            return fetch('http://localhost:3000/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } else {
            throw new Error('Login failed');
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Categories Test:', data);
        console.log('📂 Categories found:', data.data?.categories?.length || 0);
    })
    .catch(error => {
        console.error('❌ API Test Failed:', error);
    });