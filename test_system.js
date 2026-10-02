const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {}
        };

        let dataString = '';
        if (body) {
            dataString = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(dataString);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                let parsed = responseData;
                try {
                    parsed = JSON.parse(responseData);
                } catch (e) {}
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
            });
        });

        req.on('error', (err) => reject(err));

        if (body) {
            req.write(dataString);
        }
        req.end();
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('==================================================');
    console.log('STARTING AUTOMATED VERIFICATION SUITE (TESTS 1 to 13)');
    console.log('==================================================\n');

    let nodePath = 'node';
    if (fs.existsSync('C:\\Program Files\\nodejs\\node.exe')) {
        nodePath = 'C:\\Program Files\\nodejs\\node.exe';
    }

    // Start Server for Phase 1
    console.log('🚀 Phase 1: Launching Node.js Server...');
    let serverProcess = spawn(nodePath, ['server.js'], {
        cwd: __dirname,
        env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` }
    });

    serverProcess.stdout.on('data', (data) => console.log(`[SERVER]: ${data.toString().trim()}`));
    serverProcess.stderr.on('data', (data) => console.error(`[SERVER ERR]: ${data.toString().trim()}`));

    await sleep(2000);

    try {
        // TEST 3: Verify Frontend HTTP 200
        console.log('\n--- TEST 3: Checking http://localhost:3000 ---');
        const resHtml = await makeRequest('GET', '/');
        console.log(`HTTP Status: ${resHtml.statusCode}`);
        if (resHtml.statusCode !== 200 || !resHtml.data.includes('COMPLAINT MANAGEMENT SYSTEM')) {
            throw new Error('Frontend failed to load correctly!');
        }
        console.log('✅ TEST 3 PASSED: Frontend loaded successfully.');

        // TEST 4: Create User
        console.log('\n--- TEST 4: Creating User via POST /api/users ---');
        const userRes = await makeRequest('POST', '/api/users', {
            first_name: 'Rahul',
            last_name: 'Kumar',
            email: 'rahul@example.com',
            phone_number: '9876543210'
        });
        console.log('Response:', userRes.data);
        if (userRes.statusCode !== 201 || !userRes.data.user_id) {
            throw new Error('Failed to create user!');
        }
        const createdUserId = userRes.data.user_id;
        console.log(`✅ TEST 4 PASSED: User created with ID #${createdUserId}.`);

        // TEST 5: Create Department
        console.log('\n--- TEST 5: Creating Department via POST /api/departments ---');
        const deptRes = await makeRequest('POST', '/api/departments', {
            department_name: 'IT Department',
            location: 'Block A',
            service_area: 'Computer and Network Services'
        });
        console.log('Response:', deptRes.data);
        if (deptRes.statusCode !== 201 || !deptRes.data.department_id) {
            throw new Error('Failed to create department!');
        }
        const createdDeptId = deptRes.data.department_id;
        console.log(`✅ TEST 5 PASSED: Department created with ID #${createdDeptId}.`);

        // TEST 6: Create Complaint
        console.log('\n--- TEST 6: Creating Complaint via POST /api/complaints ---');
        const complaintRes = await makeRequest('POST', '/api/complaints', {
            user_id: createdUserId,
            department_id: createdDeptId,
            complaint_state: 'Pending',
            category: 'Technical',
            description: 'Unable to access college portal'
        });
        console.log('Response:', complaintRes.data);
        if (complaintRes.statusCode !== 201 || !complaintRes.data.complaint_id) {
            throw new Error('Failed to create complaint!');
        }
        const createdComplaintId = complaintRes.data.complaint_id;
        console.log(`✅ TEST 6 PASSED: Complaint created with ID #${createdComplaintId}.`);

        // TEST 7: Create Complaint Status
        console.log('\n--- TEST 7: Creating Complaint Status via POST /api/status ---');
        const statusRes = await makeRequest('POST', '/api/status', {
            complaint_id: createdComplaintId,
            status: 'In Progress',
            resolved_date: '',
            remarks: 'Complaint assigned to technical team',
            resolution_time: '2 hours'
        });
        console.log('Response:', statusRes.data);
        if (statusRes.statusCode !== 201 || !statusRes.data.status_id) {
            throw new Error('Failed to create complaint status!');
        }
        console.log(`✅ TEST 7 PASSED: Complaint Status updated with Status ID #${statusRes.data.status_id}.`);

        // TEST 8 & 9: Retrieve Records & Verify SQL JOIN
        console.log('\n--- TEST 8 & 9: Retrieving Records & Validating SQL JOINs ---');
        const usersList = await makeRequest('GET', '/api/users');
        const deptsList = await makeRequest('GET', '/api/departments');
        const complaintsList = await makeRequest('GET', '/api/complaints');
        const statusList = await makeRequest('GET', '/api/status');

        console.log(`Users count: ${usersList.data.data.length}`);
        console.log(`Departments count: ${deptsList.data.data.length}`);
        console.log(`Complaints count: ${complaintsList.data.data.length}`);
        console.log(`Status records count: ${statusList.data.data.length}`);

        const firstComp = complaintsList.data.data.find(c => c.complaint_id === createdComplaintId);
        if (!firstComp || firstComp.first_name !== 'Rahul' || firstComp.department_name !== 'IT Department') {
            throw new Error('SQL JOIN failed to return combined user and department fields!');
        }
        console.log('✅ TEST 8 & 9 PASSED: SQL JOIN returned combined readable data:', {
            complaint_id: firstComp.complaint_id,
            user: `${firstComp.first_name} ${firstComp.last_name}`,
            department: firstComp.department_name
        });

        // TEST 10: Foreign Key Validation (Invalid user_id)
        console.log('\n--- TEST 10: Foreign Key Check (Invalid user_id 99999) ---');
        const fkUserRes = await makeRequest('POST', '/api/complaints', {
            user_id: 99999,
            department_id: createdDeptId,
            complaint_state: 'Pending',
            category: 'Technical',
            description: 'Invalid user test'
        });
        console.log(`HTTP Status: ${fkUserRes.statusCode}`, fkUserRes.data);
        if (fkUserRes.statusCode !== 404 && fkUserRes.statusCode !== 400) {
            throw new Error('Server failed to reject invalid user_id!');
        }
        console.log('✅ TEST 10 PASSED: Invalid user_id rejected as expected.');

        // TEST 11: Foreign Key Validation (Invalid department_id)
        console.log('\n--- TEST 11: Foreign Key Check (Invalid department_id 99999) ---');
        const fkDeptRes = await makeRequest('POST', '/api/complaints', {
            user_id: createdUserId,
            department_id: 99999,
            complaint_state: 'Pending',
            category: 'Technical',
            description: 'Invalid department test'
        });
        console.log(`HTTP Status: ${fkDeptRes.statusCode}`, fkDeptRes.data);
        if (fkDeptRes.statusCode !== 404 && fkDeptRes.statusCode !== 400) {
            throw new Error('Server failed to reject invalid department_id!');
        }
        console.log('✅ TEST 11 PASSED: Invalid department_id rejected as expected.');

        // TEST 12: Verify Dashboard API
        console.log('\n--- TEST 12: Verifying GET /api/dashboard ---');
        const dashRes = await makeRequest('GET', '/api/dashboard');
        console.log('Dashboard Data:', dashRes.data);
        if (!dashRes.data.success || dashRes.data.users < 1 || dashRes.data.complaints < 1) {
            throw new Error('Dashboard stats verification failed!');
        }
        console.log('✅ TEST 12 PASSED: Dashboard count stats retrieved accurately.');

        // Kill server for TEST 13
        console.log('\nStopping server to prepare for persistence test...');
        serverProcess.kill('SIGTERM');
        await sleep(1500);

        // TEST 13: Persistence test after restart
        console.log('\n--- TEST 13: Restarting Server & Verifying SQLite Persistence ---');
        serverProcess = spawn(nodePath, ['server.js'], {
            cwd: __dirname,
            env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` }
        });

        await sleep(2000);

        const checkUsersAfterRestart = await makeRequest('GET', '/api/users');
        const checkComplaintsAfterRestart = await makeRequest('GET', '/api/complaints');

        console.log(`Users after restart: ${checkUsersAfterRestart.data.data.length}`);
        console.log(`Complaints after restart: ${checkComplaintsAfterRestart.data.data.length}`);

        if (checkUsersAfterRestart.data.data.length === 0 || checkComplaintsAfterRestart.data.data.length === 0) {
            throw new Error('Data persistence check failed! Database cleared upon restart.');
        }

        console.log('✅ TEST 13 PASSED: SQLite Database successfully persisted records across server restarts!');

        console.log('\n==================================================');
        console.log('🎉 ALL 13 TEST CASES PASSED SUCCESSFULLY!');
        console.log('==================================================');

    } catch (err) {
        console.error('❌ TEST FAILED:', err.message);
        process.exitCode = 1;
    } finally {
        if (serverProcess) {
            serverProcess.kill('SIGTERM');
        }
    }
}

runTests();
