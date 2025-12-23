/**
 * Comprehensive API Endpoint Testing
 * Tests all endpoints with real scenarios
 */
require('dotenv').config();
const axios = require('axios').default;
const mysql = require('mysql2/promise');

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
let authTokens = {
  student: null,
  clubRep: null,
  admin: null
};

const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

// Test helper functions
function logTest(name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  if (status === 'PASS') {
    testResults.passed.push(result);
    console.log(`✅ PASS: ${name}`);
  } else if (status === 'FAIL') {
    testResults.failed.push(result);
    console.log(`❌ FAIL: ${name} - ${details}`);
  } else {
    testResults.skipped.push(result);
    console.log(`⏭️  SKIP: ${name} - ${details}`);
  }
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    // Extract error message from various possible locations
    let errorMessage = error.message;
    if (error.response?.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
        }
      }
    }
    
    const errorDetails = error.response?.data || { message: error.message };
    return {
      success: false,
      error: errorDetails,
      errorMessage: errorMessage,
      status: error.response?.status || 500
    };
  }
}

// ============================================
// 1. AUTHENTICATION TESTS
// ============================================
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');

  // Test 1: Register Student
  const studentData = {
    email: `test.student.${Date.now()}@test.com`,
    password: 'Test123456',
    name: 'Test Student',
    role: 'student'
  };
  let result = await makeRequest('POST', '/auth/register', studentData);
  if (result.success && result.data.success) {
    logTest('Register Student', 'PASS');
  } else {
    const errorMsg = result.errorMessage || (result.error?.message) || (typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
    logTest('Register Student', 'FAIL', errorMsg || 'Registration failed');
  }

  // Test 2: Register Club Rep
  const clubRepData = {
    email: `test.clubrep.${Date.now()}@test.com`,
    password: 'Test123456',
    name: 'Test Club Rep',
    role: 'club_representative'
  };
  result = await makeRequest('POST', '/auth/register', clubRepData);
  if (result.success && result.data.success) {
    logTest('Register Club Representative', 'PASS');
  } else {
    logTest('Register Club Representative', 'FAIL', result.errorMessage || JSON.stringify(result.error) || 'Registration failed');
  }

  // Test 3: Register Admin
  const adminData = {
    email: `test.admin.${Date.now()}@test.com`,
    password: 'Test123456',
    name: 'Test Admin',
    role: 'admin'
  };
  result = await makeRequest('POST', '/auth/register', adminData);
  if (result.success && result.data.success) {
    logTest('Register Admin', 'PASS');
  } else {
    logTest('Register Admin', 'FAIL', result.errorMessage || JSON.stringify(result.error) || 'Registration failed');
  }

  // Test 4: Login Student
  result = await makeRequest('POST', '/auth/login', {
    email: studentData.email,
    password: studentData.password
  });
  if (result.success && result.data.data?.token) {
    authTokens.student = result.data.data.token;
    logTest('Login Student', 'PASS');
  } else {
    logTest('Login Student', 'FAIL', result.errorMessage || JSON.stringify(result.error) || 'Login failed');
  }

  // Test 5: Login Club Rep
  result = await makeRequest('POST', '/auth/login', {
    email: clubRepData.email,
    password: clubRepData.password
  });
  if (result.success && result.data.data?.token) {
    authTokens.clubRep = result.data.data.token;
    logTest('Login Club Representative', 'PASS');
  } else {
    logTest('Login Club Representative', 'FAIL', result.errorMessage || JSON.stringify(result.error) || 'Login failed');
  }

  // Test 6: Login Admin
  result = await makeRequest('POST', '/auth/login', {
    email: adminData.email,
    password: adminData.password
  });
  if (result.success && result.data.data?.token) {
    authTokens.admin = result.data.data.token;
    logTest('Login Admin', 'PASS');
  } else {
    logTest('Login Admin', 'FAIL', result.errorMessage || JSON.stringify(result.error) || 'Login failed');
  }

  // Test 7: Get Current User
  if (authTokens.student) {
    result = await makeRequest('GET', '/auth/me', null, authTokens.student);
    if (result.success && result.data.data?.user) {
      logTest('Get Current User', 'PASS');
    } else {
      logTest('Get Current User', 'FAIL', result.error?.message || 'Failed to get user');
    }
  }

  // Test 8: Invalid Login
  result = await makeRequest('POST', '/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  });
  if (!result.success && result.status === 401) {
    logTest('Invalid Login (Error Handling)', 'PASS');
  } else {
    logTest('Invalid Login (Error Handling)', 'FAIL', 'Should return 401 for invalid credentials');
  }
}

// ============================================
// 2. EVENT TESTS
// ============================================
async function testEvents() {
  console.log('\n📅 Testing Event Endpoints...\n');

  if (!authTokens.clubRep) {
    logTest('Create Event', 'SKIP', 'Club Rep token not available');
    return;
  }

  // Test 1: Create Event (Club Rep)
  const eventData = {
    title: `Test Event ${Date.now()}`,
    description: 'This is a test event description that is long enough',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    location: {
      name: 'Test Venue',
      address: '123 Test Street'
    },
    maxSeats: 50,
    category: 'workshop'
  };
  
  // Create a past event for feedback testing
  // Note: System doesn't allow creating events in the past, so we'll create it with a future date
  // then directly update the database to set it to past after approval
  const pastEventData = {
    title: `Past Test Event ${Date.now()}`,
    description: 'This is a past test event for feedback',
    date: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now (will update to past in DB)
    location: {
      name: 'Test Venue',
      address: '123 Test Street'
    },
    maxSeats: 50,
    category: 'workshop'
  };

  let result = await makeRequest('POST', '/events', eventData, authTokens.clubRep);
  let eventId = null;
  if (result.success && result.data.data?.event) {
    eventId = result.data.data.event.id || result.data.data.event._id;
    logTest('Create Event (Club Rep)', 'PASS');
  } else {
    logTest('Create Event (Club Rep)', 'FAIL', result.error?.message || 'Event creation failed');
  }

  // Test 2: Get All Events
  result = await makeRequest('GET', '/events');
  if (result.success && Array.isArray(result.data.data?.events)) {
    logTest('Get All Events', 'PASS');
  } else {
    logTest('Get All Events', 'FAIL', 'Should return array of events');
  }

  // Test 3: Get Event by ID
  if (eventId) {
    result = await makeRequest('GET', `/events/${eventId}`);
    if (result.success && result.data.data?.event) {
      logTest('Get Event by ID', 'PASS');
    } else {
      logTest('Get Event by ID', 'FAIL', result.error?.message || 'Failed to get event');
    }
  }

  // Test 4: Update Event (Club Rep) - Must be done BEFORE approval
  if (eventId && authTokens.clubRep) {
    // Update before approval (approved events might have restrictions)
    // Use unique title to avoid "already exists" error
    const uniqueTitle = `Updated Test Event ${Date.now()}`;
    result = await makeRequest('PUT', `/events/${eventId}`, {
      title: uniqueTitle,
      description: 'This is an updated test event description'
    }, authTokens.clubRep);
    if (result.success && result.data.data?.event) {
      logTest('Update Event (Club Rep)', 'PASS');
    } else {
      const errorMsg = result.errorMessage || (result.error?.message) || (typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
      logTest('Update Event (Club Rep)', 'FAIL', errorMsg || 'Update failed');
    }
  }

  // Test 5: Approve Event (Admin) - Do this AFTER update test
  if (eventId && authTokens.admin) {
    result = await makeRequest('POST', `/events/${eventId}/approve`, null, authTokens.admin);
    if (result.success && result.data.data?.event?.status === 'approved') {
      logTest('Approve Event (Admin)', 'PASS');
    } else {
      logTest('Approve Event (Admin)', 'FAIL', result.error?.message || 'Approval failed');
    }
  }

  // Test 6: Get Pending Events (Admin)
  if (authTokens.admin) {
    result = await makeRequest('GET', '/events/pending/list', null, authTokens.admin);
    if (result.success && Array.isArray(result.data.data?.events)) {
      logTest('Get Pending Events (Admin)', 'PASS');
    } else {
      logTest('Get Pending Events (Admin)', 'FAIL', result.error?.message || 'Failed to get pending events');
    }
  }

  // Create past event for feedback testing
  let pastEventId = null;
  if (authTokens.clubRep && pastEventData) {
    result = await makeRequest('POST', '/events', pastEventData, authTokens.clubRep);
    if (result.success && result.data.data?.event) {
      pastEventId = result.data.data.event.id || result.data.data.event._id;
      // Approve the past event so it can be used
      if (authTokens.admin && pastEventId && authTokens.student) {
        const approveResult = await makeRequest('POST', `/events/${pastEventId}/approve`, null, authTokens.admin);
        if (approveResult.success) {
          // Register student for event BEFORE updating date to past
          await makeRequest('POST', '/registrations', { eventId: pastEventId }, authTokens.student);
          
          // Directly update the database to set event date to past (bypassing validation)
          try {
            const connection = await mysql.createConnection({
              host: process.env.MYSQL_HOST || 'localhost',
              port: process.env.MYSQL_PORT || 3306,
              user: process.env.MYSQL_USER || 'root',
              password: process.env.MYSQL_PASSWORD || '',
              database: process.env.MYSQL_DATABASE || 'sams_db'
            });
            const pastDate = new Date(Date.now() - 86400000); // Yesterday
            await connection.execute(
              'UPDATE events SET date = ? WHERE id = ?',
              [pastDate, pastEventId]
            );
            await connection.end();
          } catch (dbError) {
            console.log(`Note: Could not update event date in database: ${dbError.message}`);
          }
        } else {
          console.log(`Warning: Could not approve past event ${pastEventId} for feedback testing`);
        }
      }
    } else {
      console.log(`Warning: Could not create past event for feedback testing: ${result.errorMessage || 'Unknown error'}`);
    }
  }

  return { eventId, pastEventId };
}

// ============================================
// 3. REGISTRATION TESTS
// ============================================
async function testRegistrations(eventId) {
  console.log('\n📝 Testing Registration Endpoints...\n');

  if (!eventId || !authTokens.student) {
    logTest('Register for Event', 'SKIP', 'Event ID or student token not available');
    return;
  }

  // Test 1: Register for Event
  let result = await makeRequest('POST', '/registrations', {
    eventId: eventId
  }, authTokens.student);

  if (result.success && result.data.data?.registration) {
    logTest('Register for Event', 'PASS');
  } else {
    logTest('Register for Event', 'FAIL', result.error?.message || 'Registration failed');
  }

  // Test 2: Get My Registrations
  result = await makeRequest('GET', '/registrations/my-registrations', null, authTokens.student);
  if (result.success && Array.isArray(result.data.data?.registrations)) {
    logTest('Get My Registrations', 'PASS');
  } else {
    logTest('Get My Registrations', 'FAIL', result.error?.message || 'Failed to get registrations');
  }

  // Test 3: Check Registration
  result = await makeRequest('GET', `/registrations/check/${eventId}`, null, authTokens.student);
  if (result.success) {
    logTest('Check Registration Status', 'PASS');
  } else {
    logTest('Check Registration Status', 'FAIL', result.error?.message || 'Check failed');
  }

  // Test 4: Cancel Registration
  result = await makeRequest('DELETE', `/registrations/${eventId}`, null, authTokens.student);
  if (result.success) {
    logTest('Cancel Registration', 'PASS');
  } else {
    logTest('Cancel Registration', 'FAIL', result.error?.message || 'Cancellation failed');
  }
}

// ============================================
// 4. ATTENDANCE TESTS
// ============================================
async function testAttendance(eventId) {
  console.log('\n✅ Testing Attendance Endpoints...\n');

  if (!eventId || !authTokens.clubRep || !authTokens.student) {
    logTest('Mark Attendance', 'SKIP', 'Required tokens or event ID not available');
    return;
  }

  // Re-register student first
  await makeRequest('POST', '/registrations', { eventId }, authTokens.student);

  // Get user ID from token (would need to decode JWT or get from /auth/me)
  const userResult = await makeRequest('GET', '/auth/me', null, authTokens.student);
  const userId = userResult.data?.data?.user?.id || userResult.data?.data?.user?._id;

  if (!userId) {
    logTest('Mark Attendance', 'SKIP', 'Could not get user ID');
    return;
  }

  // Test 1: Mark Attendance
  let result = await makeRequest('POST', '/attendances', {
    eventId: eventId,
    userId: userId,
    status: 'present'
  }, authTokens.clubRep);

  if (result.success && result.data.data?.attendance) {
    logTest('Mark Attendance', 'PASS');
  } else {
    logTest('Mark Attendance', 'FAIL', result.error?.message || 'Failed to mark attendance');
  }

  // Test 2: Get Event Attendance
  result = await makeRequest('GET', `/attendances/event/${eventId}`, null, authTokens.clubRep);
  if (result.success && Array.isArray(result.data.data?.attendances)) {
    logTest('Get Event Attendance', 'PASS');
  } else {
    logTest('Get Event Attendance', 'FAIL', result.error?.message || 'Failed to get attendance');
  }

  // Test 3: Get Attendance Statistics
  result = await makeRequest('GET', `/attendances/event/${eventId}/stats`, null, authTokens.clubRep);
  if (result.success && result.data.data) {
    logTest('Get Attendance Statistics', 'PASS');
  } else {
    logTest('Get Attendance Statistics', 'FAIL', result.error?.message || 'Failed to get stats');
  }
}

// ============================================
// 5. FEEDBACK TESTS
// ============================================
async function testFeedback(eventId, pastEventId) {
  console.log('\n💬 Testing Feedback Endpoints...\n');

  if (!pastEventId || !authTokens.student) {
    logTest('Submit Feedback', 'SKIP', `Past event ID (${pastEventId}) or student token not available`);
    return;
  }

  // Registration should already be done when creating the past event (before date was updated to past)
  // Just verify registration exists, if not, try to register (though it might fail for past events)

  // Test 1: Submit Feedback (only works for past events)
  let result = await makeRequest('POST', '/feedbacks', {
    eventId: pastEventId,
    rating: 5,
    comment: 'Great event!'
  }, authTokens.student);

  if (result.success && result.data.data?.feedback) {
    logTest('Submit Feedback', 'PASS');
  } else {
    let errorMsg = 'Feedback submission failed';
    if (result.errorMessage) {
      errorMsg = result.errorMessage;
    } else if (result.error) {
      if (typeof result.error === 'string') {
        errorMsg = result.error;
      } else if (result.error.message) {
        errorMsg = result.error.message;
      } else {
        errorMsg = JSON.stringify(result.error);
      }
    }
    logTest('Submit Feedback', 'FAIL', errorMsg);
  }

  // Test 2: Get Event Feedbacks
  result = await makeRequest('GET', `/feedbacks/event/${eventId}`, null, authTokens.student);
  if (result.success && Array.isArray(result.data.data?.feedbacks)) {
    logTest('Get Event Feedbacks', 'PASS');
  } else {
    logTest('Get Event Feedbacks', 'FAIL', result.error?.message || 'Failed to get feedbacks');
  }
}

// ============================================
// 6. NOTIFICATION TESTS
// ============================================
async function testNotifications() {
  console.log('\n🔔 Testing Notification Endpoints...\n');

  if (!authTokens.student) {
    logTest('Get Notifications', 'SKIP', 'Student token not available');
    return;
  }

  // Test 1: Get Notifications
  let result = await makeRequest('GET', '/notifications', null, authTokens.student);
  if (result.success && Array.isArray(result.data.data?.notifications)) {
    logTest('Get Notifications', 'PASS');
  } else {
    logTest('Get Notifications', 'FAIL', result.error?.message || 'Failed to get notifications');
  }

  // Test 2: Count Unread
  result = await makeRequest('GET', '/notifications/unread/count', null, authTokens.student);
  if (result.success) {
    logTest('Count Unread Notifications', 'PASS');
  } else {
    logTest('Count Unread Notifications', 'FAIL', result.error?.message || 'Failed to count');
  }
}

// ============================================
// 7. ANALYTICS TESTS
// ============================================
async function testAnalytics() {
  console.log('\n📊 Testing Analytics Endpoints...\n');

  if (!authTokens.admin) {
    logTest('Get Analytics', 'SKIP', 'Admin token not available');
    return;
  }

  // Test 1: Get Dashboard Stats
  let result = await makeRequest('GET', '/analytics/dashboard', null, authTokens.admin);
  if (result.success && result.data.data) {
    logTest('Get Dashboard Analytics', 'PASS');
  } else {
    logTest('Get Dashboard Analytics', 'FAIL', result.error?.message || 'Failed to get analytics');
  }
}

// ============================================
// 8. MENU TESTS
// ============================================
async function testMenu() {
  console.log('\n📋 Testing Dynamic Menu Endpoint...\n');

  // Test 1: Menu without auth (Guest)
  let result = await makeRequest('GET', '/menu');
  if (result.success && result.data.data?.menu && result.data.data?.role === 'guest') {
    logTest('Get Menu (Guest)', 'PASS');
  } else {
    logTest('Get Menu (Guest)', 'FAIL', result.error?.message || 'Menu failed');
  }

  // Test 2: Menu with Student
  if (authTokens.student) {
    result = await makeRequest('GET', '/menu', null, authTokens.student);
    if (result.success && result.data.data?.role === 'student') {
      logTest('Get Menu (Student)', 'PASS');
    } else {
      logTest('Get Menu (Student)', 'FAIL', result.error?.message || 'Menu failed');
    }
  }

  // Test 3: Menu with Admin
  if (authTokens.admin) {
    result = await makeRequest('GET', '/menu', null, authTokens.admin);
    if (result.success && result.data.data?.role === 'admin') {
      logTest('Get Menu (Admin)', 'PASS');
    } else {
      logTest('Get Menu (Admin)', 'FAIL', result.error?.message || 'Menu failed');
    }
  }
}

// ============================================
// 9. USER MANAGEMENT TESTS (Admin)
// ============================================
async function testUserManagement() {
  console.log('\n👥 Testing User Management Endpoints...\n');

  if (!authTokens.admin) {
    logTest('Get All Users', 'SKIP', 'Admin token not available');
    return;
  }

  // Test 1: Get All Users
  let result = await makeRequest('GET', '/users', null, authTokens.admin);
  if (result.success && Array.isArray(result.data.data?.users)) {
    logTest('Get All Users (Admin)', 'PASS');
  } else {
    logTest('Get All Users (Admin)', 'FAIL', result.error?.message || 'Failed to get users');
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  try {
    // Run all test suites
    await testAuthentication();
    const { eventId, pastEventId } = await testEvents();
    await testRegistrations(eventId);
    await testAttendance(eventId);
    await testFeedback(eventId, pastEventId);
    await testNotifications();
    await testAnalytics();
    await testMenu();
    await testUserManagement();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⏭️  Skipped: ${testResults.skipped.length}`);
    console.log(`📈 Success Rate: ${((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1)}%`);

    if (testResults.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.failed.forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
}

// Check if axios is installed
try {
  require('axios');
  runAllTests();
} catch (error) {
  console.error('❌ axios package is required for API testing.');
  console.error('   Install it with: npm install axios');
  process.exit(1);
}

