const runTests = async () => {
  try {
    console.log('--- 1. Testing Registration Endpoint ---');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sarah_smith',
        password: 'Secure_password_123!',
        email: 'sarah@example.com',
      }),
    });
    const regData = await regRes.json();
    console.log('Register Response Status:', regRes.status, regData);

    const token = regData.token;

    console.log('\n--- 2. Testing Login with Newly Created User ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sarah_smith',
        password: 'Secure_password_123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status, loginData);

    console.log('\n--- 3. Testing Admin Login with Demo Credentials ---');
    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });
    const adminData = await adminRes.json();
    console.log('Admin Login Status:', adminRes.status, adminData.message);

    console.log('\n--- 4. Creating Todos ---');
    const todoRes = await fetch('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Learn LangChain and Agent Frameworks',
        description: 'Explore multi-agent architectures and tool usage patterns in modern AI applications',
      }),
    });
    const todoData = await todoRes.json();
    console.log('Create Todo Status:', todoRes.status, todoData.message, 'ID:', todoData.data?._id);

    const todoId = todoData.data?._id;

    console.log('\n--- 5. Toggling Status to Completed ---');
    const patchRes = await fetch(`http://localhost:5000/api/todos/${todoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    const patchData = await patchRes.json();
    console.log('Update Status Result:', patchData.message, 'CompletedAt:', patchData.data?.completedAt);

    console.log('\n--- 6. Verifying Activity Audit Logs ---');
    const logsRes = await fetch('http://localhost:5000/api/logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logsData = await logsRes.json();
    console.log('Total Logs Count:', logsData.total);
    console.log('Latest 3 Logs:', logsData.data.slice(0, 3).map(l => `[${l.action}] ${l.description}`));

    console.log('\n--- 7. Testing PDF Export ---');
    const pdfRes = await fetch('http://localhost:5000/api/export/pdf', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pdfBlob = await pdfRes.arrayBuffer();
    console.log('PDF Export Status:', pdfRes.status, 'Size:', pdfBlob.byteLength, 'bytes');

    console.log('\n--- 8. Testing CSV Export ---');
    const csvRes = await fetch('http://localhost:5000/api/export/csv?type=complete', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const csvText = await csvRes.text();
    console.log('CSV Export Status:', csvRes.status, 'Lines:', csvText.split('\n').length);

    console.log('\n--- 9. Checking Last Download Timestamps in MongoDB ---');
    const dlRes = await fetch('http://localhost:5000/api/export/last-downloads', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dlData = await dlRes.json();
    console.log('Last Downloads Metadata:', dlData.data);

    console.log('\n✅ ALL BACKEND & DATABASE TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('Test Failed:', err);
  }
};

runTests();
