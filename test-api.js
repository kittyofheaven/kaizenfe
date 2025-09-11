// Simple API test script
const API_BASE_URL = 'http://localhost:3000';
const API_VERSION = '/api/v1';

async function testAPI() {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test users endpoint
    console.log('2. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}${API_VERSION}/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', usersData);
    
    // Test women washing machine facilities
    console.log('3. Testing women washing machine facilities...');
    const womenFacilitiesResponse = await fetch(`${API_BASE_URL}${API_VERSION}/mesin-cuci-cewe/facilities`);
    const womenFacilitiesData = await womenFacilitiesResponse.json();
    console.log('✅ Women Facilities:', womenFacilitiesData);
    
    // Test men washing machine facilities
    console.log('4. Testing men washing machine facilities...');
    const menFacilitiesResponse = await fetch(`${API_BASE_URL}${API_VERSION}/mesin-cuci-cowo/facilities`);
    const menFacilitiesData = await menFacilitiesResponse.json();
    console.log('✅ Men Facilities:', menFacilitiesData);
    
    // Test women washing machine bookings
    console.log('5. Testing women washing machine bookings...');
    const womenBookingsResponse = await fetch(`${API_BASE_URL}${API_VERSION}/mesin-cuci-cewe`);
    const womenBookingsData = await womenBookingsResponse.json();
    console.log('✅ Women Bookings:', womenBookingsData);
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testAPI();
