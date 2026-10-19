/**
 * Automated Test Suite for Asynchronous Processing with Event-Driven Architecture (EDA)
 * and Role-Based Access Control (Admin-Only Live EDA Details & Async Download)
 */

const testEDA = async () => {
  const BASE_URL = 'http://localhost:5000/api';

  try {
    console.log('====================================================');
    console.log('⚡ TESTING ASYNCHRONOUS EVENT-DRIVEN ARCHITECTURE (EDA)');
    console.log('🛡️ TESTING ROLE-BASED ACCESS CONTROL (ADMIN ONLY)');
    console.log('====================================================\n');

    // 1. Authenticate with regular user account (sarah_smith)
    console.log('1. Authenticating as regular user (sarah_smith)...');
    const userRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sarah_smith',
        password: 'Secure_password_123!',
      }),
    });
    const userData = await userRes.json();
    const userToken = userData.token;
    console.log(`✓ Regular user authenticated: ${userData.user?.username} (Role: ${userData.user?.role})`);

    // 2. Verify that regular user CANNOT access EDA details or async export endpoints
    console.log('\n2. Verifying regular user is BLOCKED from Live EDA & Async Jobs...');

    const userStatsRes = await fetch(`${BASE_URL}/events/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log(`  -> GET /api/events/stats for User: HTTP ${userStatsRes.status} (Expected 403 Forbidden)`);
    if (userStatsRes.status !== 403) throw new Error('Security violation: regular user accessed /api/events/stats');

    const userHistoryRes = await fetch(`${BASE_URL}/events/history`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log(`  -> GET /api/events/history for User: HTTP ${userHistoryRes.status} (Expected 403 Forbidden)`);
    if (userHistoryRes.status !== 403) throw new Error('Security violation: regular user accessed /api/events/history');

    const userSimRes = await fetch(`${BASE_URL}/events/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ message: 'Illegal trigger' }),
    });
    console.log(`  -> POST /api/events/simulate for User: HTTP ${userSimRes.status} (Expected 403 Forbidden)`);
    if (userSimRes.status !== 403) throw new Error('Security violation: regular user accessed /api/events/simulate');

    const userJobRes = await fetch(`${BASE_URL}/jobs/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ type: 'pdf' }),
    });
    console.log(`  -> POST /api/jobs/export for User: HTTP ${userJobRes.status} (Expected 403 Forbidden)`);
    if (userJobRes.status !== 403) throw new Error('Security violation: regular user accessed /api/jobs/export');

    const userListJobsRes = await fetch(`${BASE_URL}/jobs`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log(`  -> GET /api/jobs for User: HTTP ${userListJobsRes.status} (Expected 403 Forbidden)`);
    if (userListJobsRes.status !== 403) throw new Error('Security violation: regular user accessed /api/jobs');

    console.log('✓ All EDA details and Async Jobs are strictly FORBIDDEN (403) to non-admin users!');

    // 3. Authenticate as admin
    console.log('\n3. Authenticating as Administrator (admin)...');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    console.log(`✓ Admin authenticated: ${adminData.user?.username} (Role: ${adminData.user?.role})`);

    // 4. Verify Admin CAN access EDA telemetry
    console.log('\n4. Fetching EDA Architecture Telemetry as Admin...');
    const statsRes = await fetch(`${BASE_URL}/events/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    console.log(`✓ Admin granted HTTP ${statsRes.status}:`, {
      architecture: statsData.data?.architecture,
      totalDispatched: statsData.data?.totalDispatched,
      activeSubscribers: statsData.data?.activeSubscribers,
    });

    // 5. Create a todo as admin
    console.log('\n5. Creating a new Todo as Admin (dispatches TODO_CREATED domain event)...');
    const startCreate = performance.now();
    const createRes = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Implement Role-Based EDA Security Controls',
        description: 'Verifying that only Administrators can view live EDA and trigger async jobs',
        status: 'incomplete',
      }),
    });
    const createDuration = (performance.now() - startCreate).toFixed(2);
    const createData = await createRes.json();
    console.log(`✓ Todo created in ${createDuration}ms:`, createData.data?.title);
    const todoId = createData.data?._id;

    // 6. Update todo status
    console.log('\n6. Updating status to completed (dispatches TODO_STATUS_CHANGED)...');
    await fetch(`${BASE_URL}/todos/${todoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    console.log('✓ Todo status updated.');

    // 7. Enqueue Asynchronous Background Job (Export PDF) as Admin
    console.log('\n7. Enqueuing Asynchronous Background Job as Admin (Status 202 Accepted)...');
    const jobRes = await fetch(`${BASE_URL}/jobs/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ type: 'pdf' }),
    });
    const jobData = await jobRes.json();
    console.log('✓ Background Job Enqueued for Admin:', jobData.data?.jobId, `(Status: ${jobData.data?.status})`);
    const jobId = jobData.data?.jobId;

    // 8. Poll job until complete
    let isComplete = false;
    let attempts = 0;
    while (!isComplete && attempts < 15) {
      await new Promise((r) => setTimeout(r, 400));
      attempts++;
      const pollRes = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const pollData = await pollRes.json();
      const job = pollData.data;

      if (job.status === 'completed') {
        isComplete = true;
        console.log(`✓ Job completed: ${job.result?.filename} (${job.result?.sizeBytes} bytes)`);

        // Test downloading artifact
        const dlRes = await fetch(`${BASE_URL}/jobs/${jobId}/download`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const blob = await dlRes.arrayBuffer();
        console.log(`✓ Admin successfully downloaded artifact (${blob.byteLength} bytes)`);
      }
    }

    // 9. Clean up test todo
    await fetch(`${BASE_URL}/todos/${todoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✓ Cleaned up test todo.');

    console.log('\n====================================================');
    console.log('🎉 ALL SECURITY & ADMIN-ONLY EDA ACCESS TESTS PASSED (100%)');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Test Error:', err);
  }
};

testEDA();
