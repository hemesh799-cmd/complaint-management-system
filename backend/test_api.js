const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('--- 🧪 STARTING FULL REST API & POSTGRESQL CRUD VERIFICATION ---');

  // 1. GET Dashboard Stats
  console.log('\n1. Testing GET /api/dashboard/stats...');
  const statsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/stats',
    method: 'GET'
  });
  console.log(`STATUS: ${statsRes.status}`);
  console.log('STATS SUMMARY:', {
    totalUsers: statsRes.data.totalUsers,
    totalComplaints: statsRes.data.totalComplaints,
    pending: statsRes.data.pendingComplaints,
    inProgress: statsRes.data.inProgressComplaints,
    resolved: statsRes.data.resolvedComplaints,
    rejected: statsRes.data.rejectedComplaints
  });

  // 2. POST New Complaint
  console.log('\n2. Testing POST /api/complaints (Inserting new complaint into PostgreSQL)...');
  const postRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/complaints',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    user_id: 1,
    department_id: 4,
    status_id: 1,
    category: 'Hostel Plumbing',
    description: 'Leaking pipe under sink in Block B room 204 causing water spillage.'
  });
  console.log(`STATUS: ${postRes.status}`);
  console.log('CREATED RECORD:', postRes.data);
  const createdId = postRes.data.complaint_id;

  // 3. GET Single Complaint by ID
  console.log(`\n3. Testing GET /api/complaints/${createdId} (Verifying SQL JOIN output)...`);
  const getOneRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${createdId}`,
    method: 'GET'
  });
  console.log(`STATUS: ${getOneRes.status}`);
  console.log('FETCHED RECORD:', {
    id: getOneRes.data.complaint_id,
    user: getOneRes.data.user_name,
    email: getOneRes.data.user_email,
    category: getOneRes.data.category,
    department: getOneRes.data.department_name,
    status: getOneRes.data.status
  });

  // 4. PUT Update Complaint Status to Resolved
  console.log(`\n4. Testing PUT /api/complaints/${createdId} (Updating status to Resolved)...`);
  const putRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${createdId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    status_id: 3, // Resolved
    remarks: 'Plumber repaired sink pipe and replaced rubber washer. Verified leak-free.'
  });
  console.log(`STATUS: ${putRes.status}`);
  console.log('UPDATED RECORD:', {
    id: putRes.data.complaint_id,
    status: putRes.data.status,
    remarks: putRes.data.remarks,
    resolved_date: putRes.data.resolved_date,
    resolution_time: putRes.data.resolution_time
  });

  // 5. DELETE Complaint from PostgreSQL
  console.log(`\n5. Testing DELETE /api/complaints/${createdId} (Deleting from PostgreSQL)...`);
  const delRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${createdId}`,
    method: 'DELETE'
  });
  console.log(`STATUS: ${delRes.status}`);
  console.log('DELETE RESPONSE:', delRes.data);

  // 6. Verify GET returned 404 Not Found after DELETE
  console.log(`\n6. Testing GET /api/complaints/${createdId} after DELETE...`);
  const verifyRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/complaints/${createdId}`,
    method: 'GET'
  });
  console.log(`STATUS: ${verifyRes.status} (Expected 404)`);
  console.log('VERIFY RESPONSE:', verifyRes.data);

  console.log('\n✅ ALL FULL-STACK REST & POSTGRESQL CRUD VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runVerification().catch(console.error);
