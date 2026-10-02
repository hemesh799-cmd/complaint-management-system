// JavaScript Client Logic for Complaint Management System (College DBMS Project)

let activeView = null; // 'users', 'departments', 'complaints', 'statuses'

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    loadComplaints(); // Default initial record view
});

// Toast notification display helper
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-message');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast hidden';
    }, 4000);
}

// Result Box display helper inside card forms
function showResultBox(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    el.innerHTML = message;
    el.className = `result-box ${isSuccess ? 'success' : 'error'}`;
}

function hideResultBox(elementId) {
    const el = document.getElementById(elementId);
    el.className = 'result-box hidden';
    el.innerHTML = '';
}

// Refresh Dashboard Summary Counts
async function fetchDashboardStats() {
    try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.success) {
            document.getElementById('stat-users').textContent = data.users;
            document.getElementById('stat-departments').textContent = data.departments;
            document.getElementById('stat-complaints').textContent = data.complaints;
            document.getElementById('stat-resolved').textContent = data.resolved;
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

// Set Active Button styling
function setActiveButton(index) {
    const buttons = document.querySelectorAll('.button-group .btn');
    buttons.forEach((btn, i) => {
        if (i === index) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// --------------------------------------------------
// SECTION 1: SAVE USER
// --------------------------------------------------
async function handleUserSubmit(event) {
    event.preventDefault();
    hideResultBox('user-result');

    const firstName = document.getElementById('user-first-name').value.trim();
    const lastName = document.getElementById('user-last-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();

    if (!firstName || !lastName || !email || !phone) {
        showResultBox('user-result', '⚠️ Please fill out all required fields.', false);
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResultBox('user-result', `✅ User saved successfully.<br><strong>User ID: ${data.user_id}</strong>`, true);
            showToast(`User registered! ID: ${data.user_id}`, 'success');
            document.getElementById('user-form').reset();
            fetchDashboardStats();
            if (activeView === 'users') loadUsers();
        } else {
            showResultBox('user-result', `❌ Error: ${data.message || 'Failed to save user'}`, false);
        }
    } catch (err) {
        showResultBox('user-result', `❌ Server Connection Error: ${err.message}`, false);
    }
}

// --------------------------------------------------
// SECTION 2: SAVE DEPARTMENT
// --------------------------------------------------
async function handleDeptSubmit(event) {
    event.preventDefault();
    hideResultBox('dept-result');

    const deptName = document.getElementById('dept-name').value.trim();
    const location = document.getElementById('dept-location').value.trim();
    const serviceArea = document.getElementById('dept-service').value.trim();

    if (!deptName) {
        showResultBox('dept-result', '⚠️ Department Name is required.', false);
        return;
    }

    try {
        const response = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                department_name: deptName,
                location: location,
                service_area: serviceArea
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResultBox('dept-result', `✅ Department saved successfully.<br><strong>Department ID: ${data.department_id}</strong>`, true);
            showToast(`Department created! ID: ${data.department_id}`, 'success');
            document.getElementById('department-form').reset();
            fetchDashboardStats();
            if (activeView === 'departments') loadDepartments();
        } else {
            showResultBox('dept-result', `❌ Error: ${data.message || 'Failed to save department'}`, false);
        }
    } catch (err) {
        showResultBox('dept-result', `❌ Server Connection Error: ${err.message}`, false);
    }
}

// --------------------------------------------------
// SECTION 3: SUBMIT COMPLAINT
// --------------------------------------------------
async function handleComplaintSubmit(event) {
    event.preventDefault();
    hideResultBox('complaint-result');

    const userId = parseInt(document.getElementById('comp-user-id').value, 10);
    const deptId = parseInt(document.getElementById('comp-dept-id').value, 10);
    const state = document.getElementById('comp-state').value;
    const category = document.getElementById('comp-category').value;
    const description = document.getElementById('comp-description').value.trim();

    if (!userId || !deptId || !category || !description) {
        showResultBox('complaint-result', '⚠️ Please fill in all required fields properly.', false);
        return;
    }

    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                department_id: deptId,
                complaint_state: state,
                category: category,
                description: description
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResultBox('complaint-result', `✅ Complaint submitted successfully.<br><strong>Complaint ID: ${data.complaint_id}</strong>`, true);
            showToast(`Complaint registered! Complaint ID: ${data.complaint_id}`, 'success');
            document.getElementById('complaint-form').reset();
            fetchDashboardStats();
            if (activeView === 'complaints') loadComplaints();
        } else {
            showResultBox('complaint-result', `❌ ${data.message || 'Failed to submit complaint'}`, false);
        }
    } catch (err) {
        showResultBox('complaint-result', `❌ Server Connection Error: ${err.message}`, false);
    }
}

// --------------------------------------------------
// SECTION 4: UPDATE COMPLAINT STATUS
// --------------------------------------------------
async function handleStatusSubmit(event) {
    event.preventDefault();
    hideResultBox('status-result');

    const complaintId = parseInt(document.getElementById('status-comp-id').value, 10);
    const status = document.getElementById('status-state').value;
    const resolvedDate = document.getElementById('status-date').value;
    const remarks = document.getElementById('status-remarks').value.trim();
    const resolutionTime = document.getElementById('status-time').value.trim();

    if (!complaintId || !status) {
        showResultBox('status-result', '⚠️ Complaint ID and Status are required.', false);
        return;
    }

    try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                complaint_id: complaintId,
                status: status,
                resolved_date: resolvedDate,
                remarks: remarks,
                resolution_time: resolutionTime
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResultBox('status-result', `✅ Complaint status updated successfully.<br><strong>Status Record ID: ${data.status_id}</strong>`, true);
            showToast(`Status updated for Complaint #${complaintId}`, 'success');
            document.getElementById('status-form').reset();
            fetchDashboardStats();
            if (activeView === 'statuses') loadStatuses();
            if (activeView === 'complaints') loadComplaints();
        } else {
            showResultBox('status-result', `❌ ${data.message || 'Failed to update status'}`, false);
        }
    } catch (err) {
        showResultBox('status-result', `❌ Server Connection Error: ${err.message}`, false);
    }
}

// Helper to render status badge HTML
function renderStatusBadge(status) {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-');
    return `<span class="badge-status ${s}">${status}</span>`;
}

// --------------------------------------------------
// VIEW RECORDS SECTION
// --------------------------------------------------

// 1. View Users
async function loadUsers() {
    activeView = 'users';
    setActiveButton(0);
    document.getElementById('table-title').textContent = 'Stored Users (users table)';

    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');

    head.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
        </tr>
    `;

    try {
        const res = await fetch('/api/users');
        const json = await res.json();

        if (json.success && json.data) {
            document.getElementById('table-count').textContent = `${json.data.length} records`;

            if (json.data.length === 0) {
                body.innerHTML = `<tr><td colspan="5" class="empty-cell">No users registered yet.</td></tr>`;
                return;
            }

            body.innerHTML = json.data.map(user => `
                <tr>
                    <td><strong>#${user.user_id}</strong></td>
                    <td>${escapeHtml(user.first_name)}</td>
                    <td>${escapeHtml(user.last_name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${escapeHtml(user.phone_number)}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        body.innerHTML = `<tr><td colspan="5" class="empty-cell">Failed to load users: ${err.message}</td></tr>`;
    }
}

// 2. View Departments
async function loadDepartments() {
    activeView = 'departments';
    setActiveButton(1);
    document.getElementById('table-title').textContent = 'Stored Departments (departments table)';

    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');

    head.innerHTML = `
        <tr>
            <th>Department ID</th>
            <th>Department Name</th>
            <th>Location</th>
            <th>Service Area</th>
        </tr>
    `;

    try {
        const res = await fetch('/api/departments');
        const json = await res.json();

        if (json.success && json.data) {
            document.getElementById('table-count').textContent = `${json.data.length} records`;

            if (json.data.length === 0) {
                body.innerHTML = `<tr><td colspan="4" class="empty-cell">No departments registered yet.</td></tr>`;
                return;
            }

            body.innerHTML = json.data.map(dept => `
                <tr>
                    <td><strong>#${dept.department_id}</strong></td>
                    <td>${escapeHtml(dept.department_name)}</td>
                    <td>${escapeHtml(dept.location || 'N/A')}</td>
                    <td>${escapeHtml(dept.service_area || 'N/A')}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        body.innerHTML = `<tr><td colspan="4" class="empty-cell">Failed to load departments: ${err.message}</td></tr>`;
    }
}

// 3. View Complaints (Demonstrates SQL JOIN)
async function loadComplaints() {
    activeView = 'complaints';
    setActiveButton(2);
    document.getElementById('table-title').textContent = 'Complaints with User & Dept Info (SQL INNER JOIN)';

    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');

    head.innerHTML = `
        <tr>
            <th>Complaint ID</th>
            <th>User</th>
            <th>Email</th>
            <th>Department</th>
            <th>State</th>
            <th>Category</th>
            <th>Description</th>
        </tr>
    `;

    try {
        const res = await fetch('/api/complaints');
        const json = await res.json();

        if (json.success && json.data) {
            document.getElementById('table-count').textContent = `${json.data.length} records`;

            if (json.data.length === 0) {
                body.innerHTML = `<tr><td colspan="7" class="empty-cell">No complaints submitted yet.</td></tr>`;
                return;
            }

            body.innerHTML = json.data.map(item => `
                <tr>
                    <td><strong>#${item.complaint_id}</strong></td>
                    <td>${escapeHtml(item.first_name + ' ' + item.last_name)} (ID: ${item.user_id})</td>
                    <td>${escapeHtml(item.email)}</td>
                    <td>${escapeHtml(item.department_name)}</td>
                    <td>${renderStatusBadge(item.complaint_state)}</td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(item.description)}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        body.innerHTML = `<tr><td colspan="7" class="empty-cell">Failed to load complaints: ${err.message}</td></tr>`;
    }
}

// 4. View Complaint Status (Demonstrates SQL JOIN)
async function loadStatuses() {
    activeView = 'statuses';
    setActiveButton(3);
    document.getElementById('table-title').textContent = 'Status Updates & History (complaint_status JOIN complaints)';

    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');

    head.innerHTML = `
        <tr>
            <th>Status ID</th>
            <th>Complaint ID</th>
            <th>Category</th>
            <th>Status</th>
            <th>Resolved Date</th>
            <th>Remarks</th>
            <th>Resolution Time</th>
        </tr>
    `;

    try {
        const res = await fetch('/api/status');
        const json = await res.json();

        if (json.success && json.data) {
            document.getElementById('table-count').textContent = `${json.data.length} records`;

            if (json.data.length === 0) {
                body.innerHTML = `<tr><td colspan="7" class="empty-cell">No status history records found.</td></tr>`;
                return;
            }

            body.innerHTML = json.data.map(item => `
                <tr>
                    <td><strong>#${item.status_id}</strong></td>
                    <td><strong>#${item.complaint_id}</strong></td>
                    <td>${escapeHtml(item.category || 'N/A')}</td>
                    <td>${renderStatusBadge(item.status)}</td>
                    <td>${escapeHtml(item.resolved_date || 'N/A')}</td>
                    <td>${escapeHtml(item.remarks || 'N/A')}</td>
                    <td>${escapeHtml(item.resolution_time || 'N/A')}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        body.innerHTML = `<tr><td colspan="7" class="empty-cell">Failed to load status history: ${err.message}</td></tr>`;
    }
}

// Security HTML Escape Helper
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
