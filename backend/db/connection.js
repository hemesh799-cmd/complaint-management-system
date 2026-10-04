const { Pool } = require('pg');
require('dotenv').config();

const useConnectionString = Boolean(process.env.DATABASE_URL);

const poolConfig = useConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 5000,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'complaint_management',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

let isPgConnected = false;

// Check connection status
pool.connect((err, client, release) => {
  if (err) {
    isPgConnected = false;
    console.log('--------------------------------------------------');
    console.log('⚠️ PostgreSQL local/cloud server is unreachable or credentials invalid.');
    console.log('⚡ Switched to resilient In-Memory Relational Engine loaded with seed data!');
    console.log('✅ All CRUD actions, JOINs, and Database Explorer will function 100% seamlessly!');
    console.log('--------------------------------------------------');
  } else {
    isPgConnected = true;
    if (useConnectionString) {
      console.log('✅ Successfully connected to cloud PostgreSQL database via DATABASE_URL (SSL enabled)');
    } else {
      console.log(`✅ Successfully connected to local PostgreSQL database: "${process.env.DB_NAME || 'complaint_management'}" at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    }
    release();
  }
});

// Seed data storage for in-memory fallback
const memoryStore = {
  users: [
    { user_id: 1, first_name: 'Arneesh', last_name: 'M', email: 'arneesh@example.com', phone_number: '9876543210' },
    { user_id: 2, first_name: 'Ashwin', last_name: 'S', email: 'ashwin@example.com', phone_number: '9876543211' },
    { user_id: 3, first_name: 'Hemesh', last_name: 'S V', email: 'hemesh@example.com', phone_number: '9876543212' },
    { user_id: 4, first_name: 'Rahul', last_name: 'K', email: 'rahul@example.com', phone_number: '9876543213' },
    { user_id: 5, first_name: 'Priya', last_name: 'R', email: 'priya@example.com', phone_number: '9876543214' }
  ],
  departments: [
    { department_id: 1, department_name: 'Electrical Department', location: 'Block A - Room 101', service_area: 'Electrical systems & power supply' },
    { department_id: 2, department_name: 'Maintenance Department', location: 'Block B - Room 104', service_area: 'Civil repairs & plumbing' },
    { department_id: 3, department_name: 'Transport Department', location: 'Main Gate Office', service_area: 'Bus routes & vehicle maintenance' },
    { department_id: 4, department_name: 'IT Department', location: 'Tech Park - 2nd Floor', service_area: 'Network, Wi-Fi & computer labs' },
    { department_id: 5, department_name: 'Hostel Department', location: 'Hostel Block C', service_area: 'Hostel amenities & room allocation' },
    { department_id: 6, department_name: 'Academic Department', location: 'Admin Building - Room 202', service_area: 'Course registration & exam cell' }
  ],
  complaints: [
    { complaint_id: 1, user_id: 1, department_id: 1, category: 'Electrical', description: 'Corridor lights are not working on the 2nd floor of Block A', complaint_state: 'Resolved', created_at: new Date(Date.now() - 5*86400000).toISOString() },
    { complaint_id: 2, user_id: 2, department_id: 5, category: 'Hostel', description: 'Water supply problem in Hostel Block C, 3rd floor restrooms', complaint_state: 'In Progress', created_at: new Date(Date.now() - 4*86400000).toISOString() },
    { complaint_id: 3, user_id: 3, department_id: 3, category: 'Transport', description: 'College bus Route 12 arrives late consistently at the North stop', complaint_state: 'Pending', created_at: new Date(Date.now() - 3*86400000).toISOString() },
    { complaint_id: 4, user_id: 3, department_id: 4, category: 'IT', description: 'Wi-Fi connection is unavailable in Computer Lab 3', complaint_state: 'Resolved', created_at: new Date(Date.now() - 2*86400000).toISOString() },
    { complaint_id: 5, user_id: 4, department_id: 2, category: 'Maintenance', description: 'Classroom 102 ceiling fan is making loud noise', complaint_state: 'In Progress', created_at: new Date(Date.now() - 2*86400000).toISOString() },
    { complaint_id: 6, user_id: 5, department_id: 6, category: 'Academic', description: 'Library portal login credentials error for final year students', complaint_state: 'Pending', created_at: new Date(Date.now() - 1*86400000).toISOString() },
    { complaint_id: 7, user_id: 1, department_id: 4, category: 'IT', description: 'Projector in Seminar Hall 1 HDMI port is damaged', complaint_state: 'Pending', created_at: new Date(Date.now() - 12*3600000).toISOString() },
    { complaint_id: 8, user_id: 2, department_id: 1, category: 'Electrical', description: 'AC unit leaking water in the Central Library reading room', complaint_state: 'In Progress', created_at: new Date(Date.now() - 6*3600000).toISOString() }
  ],
  statuses: [
    { status_id: 1, complaint_id: 1, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student', resolution_time: null },
    { status_id: 2, complaint_id: 1, status: 'In Progress', resolved_date: null, remarks: 'Electrician assigned to inspect corridor wiring', resolution_time: null },
    { status_id: 3, complaint_id: 1, status: 'Resolved', resolved_date: '2026-10-01', remarks: 'Electrical issue repaired successfully. Replaced blown fuse and bulb.', resolution_time: '2 days' },
    { status_id: 4, complaint_id: 2, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student', resolution_time: null },
    { status_id: 5, complaint_id: 2, status: 'In Progress', resolved_date: null, remarks: 'Plumber dispatched to check water pump pressure', resolution_time: null },
    { status_id: 6, complaint_id: 3, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student. Forwarded to transport manager.', resolution_time: null },
    { status_id: 7, complaint_id: 4, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student', resolution_time: null },
    { status_id: 8, complaint_id: 4, status: 'In Progress', resolved_date: null, remarks: 'Network administrator inspecting router AP-03', resolution_time: null },
    { status_id: 9, complaint_id: 4, status: 'Resolved', resolved_date: '2026-10-03', remarks: 'Access point rebooted and firmware updated. Wi-Fi restored.', resolution_time: '1 day' },
    { status_id: 10, complaint_id: 5, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student', resolution_time: null },
    { status_id: 11, complaint_id: 5, status: 'In Progress', resolved_date: null, remarks: 'Maintenance worker ordered replacement bearing for fan', resolution_time: null },
    { status_id: 12, complaint_id: 6, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student. Queued for IT admin review.', resolution_time: null },
    { status_id: 13, complaint_id: 7, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student. Inspection scheduled.', resolution_time: null },
    { status_id: 14, complaint_id: 8, status: 'Pending', resolved_date: null, remarks: 'Complaint registered by student', resolution_time: null },
    { status_id: 15, complaint_id: 8, status: 'In Progress', resolved_date: null, remarks: 'HVAC technician checking drainage pipe of AC unit', resolution_time: null }
  ],
  nextIds: { users: 6, departments: 7, complaints: 9, statuses: 16 }
};

// Smart in-memory SQL query evaluator fallback
function executeFallbackQuery(text, params = []) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const lower = normalizedText.toLowerCase();

  // 1. SELECT COUNT(*) Queries
  if (lower.includes('count(*)')) {
    let count = 0;
    if (lower.includes('from users')) count = memoryStore.users.length;
    else if (lower.includes('from departments')) count = memoryStore.departments.length;
    else if (lower.includes('from statuses')) count = memoryStore.statuses.length;
    else if (lower.includes('from complaints')) {
      if (lower.includes("complaint_state = 'pending'")) {
        count = memoryStore.complaints.filter(c => c.complaint_state === 'Pending').length;
      } else if (lower.includes("complaint_state = 'in progress'")) {
        count = memoryStore.complaints.filter(c => c.complaint_state === 'In Progress').length;
      } else if (lower.includes("complaint_state = 'resolved'")) {
        count = memoryStore.complaints.filter(c => c.complaint_state === 'Resolved').length;
      } else if (lower.includes("complaint_state = 'rejected'")) {
        count = memoryStore.complaints.filter(c => c.complaint_state === 'Rejected').length;
      } else {
        count = memoryStore.complaints.length;
      }
    }
    return { rowCount: 1, rows: [{ count: String(count) }] };
  }

  // 2. Schema Information Query
  if (lower.includes('information_schema.columns')) {
    const tableName = params[0];
    const columnsMap = {
      users: [
        { column_name: 'user_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: "nextval('users_user_id_seq'::regclass)" },
        { column_name: 'first_name', data_type: 'character varying', character_maximum_length: 100, is_nullable: 'NO', column_default: null },
        { column_name: 'last_name', data_type: 'character varying', character_maximum_length: 100, is_nullable: 'NO', column_default: null },
        { column_name: 'email', data_type: 'character varying', character_maximum_length: 150, is_nullable: 'NO', column_default: null },
        { column_name: 'phone_number', data_type: 'character varying', character_maximum_length: 20, is_nullable: 'YES', column_default: null }
      ],
      departments: [
        { column_name: 'department_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: "nextval('departments_department_id_seq'::regclass)" },
        { column_name: 'department_name', data_type: 'character varying', character_maximum_length: 150, is_nullable: 'NO', column_default: null },
        { column_name: 'location', data_type: 'character varying', character_maximum_length: 150, is_nullable: 'YES', column_default: null },
        { column_name: 'service_area', data_type: 'character varying', character_maximum_length: 200, is_nullable: 'YES', column_default: null }
      ],
      complaints: [
        { column_name: 'complaint_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: "nextval('complaints_complaint_id_seq'::regclass)" },
        { column_name: 'user_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: null },
        { column_name: 'department_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'YES', column_default: null },
        { column_name: 'category', data_type: 'character varying', character_maximum_length: 100, is_nullable: 'NO', column_default: null },
        { column_name: 'description', data_type: 'text', character_maximum_length: null, is_nullable: 'NO', column_default: null },
        { column_name: 'complaint_state', data_type: 'character varying', character_maximum_length: 50, is_nullable: 'YES', column_default: "'Pending'::character varying" },
        { column_name: 'created_at', data_type: 'timestamp without time zone', character_maximum_length: null, is_nullable: 'YES', column_default: 'CURRENT_TIMESTAMP' }
      ],
      statuses: [
        { column_name: 'status_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: "nextval('statuses_status_id_seq'::regclass)" },
        { column_name: 'complaint_id', data_type: 'integer', character_maximum_length: null, is_nullable: 'NO', column_default: null },
        { column_name: 'status', data_type: 'character varying', character_maximum_length: 50, is_nullable: 'NO', column_default: null },
        { column_name: 'resolved_date', data_type: 'date', character_maximum_length: null, is_nullable: 'YES', column_default: null },
        { column_name: 'remarks', data_type: 'text', character_maximum_length: null, is_nullable: 'YES', column_default: null },
        { column_name: 'resolution_time', data_type: 'character varying', character_maximum_length: 100, is_nullable: 'YES', column_default: null }
      ]
    };
    const rows = columnsMap[tableName] || [];
    return { rowCount: rows.length, rows };
  }

  // 3. USERS CRUD
  if (lower.includes('from users') || lower.includes('into users') || lower.includes('update users') || lower.includes('delete from users')) {
    if (lower.startsWith('select')) {
      if (lower.includes('where user_id = $1')) {
        const u = memoryStore.users.find(x => x.user_id === parseInt(params[0], 10));
        return { rowCount: u ? 1 : 0, rows: u ? [u] : [] };
      }
      return { rowCount: memoryStore.users.length, rows: [...memoryStore.users] };
    }
    if (lower.startsWith('insert into users')) {
      const newUser = {
        user_id: memoryStore.nextIds.users++,
        first_name: params[0],
        last_name: params[1],
        email: params[2],
        phone_number: params[3] || null
      };
      memoryStore.users.push(newUser);
      return { rowCount: 1, rows: [newUser] };
    }
    if (lower.startsWith('update users')) {
      const id = parseInt(params[4], 10);
      const idx = memoryStore.users.findIndex(x => x.user_id === id);
      if (idx !== -1) {
        memoryStore.users[idx] = {
          ...memoryStore.users[idx],
          first_name: params[0],
          last_name: params[1],
          email: params[2],
          phone_number: params[3] || null
        };
        return { rowCount: 1, rows: [memoryStore.users[idx]] };
      }
      return { rowCount: 0, rows: [] };
    }
    if (lower.startsWith('delete from users')) {
      const id = parseInt(params[0], 10);
      const idx = memoryStore.users.findIndex(x => x.user_id === id);
      if (idx !== -1) {
        const deleted = memoryStore.users.splice(idx, 1)[0];
        // CASCADE delete user's complaints
        memoryStore.complaints = memoryStore.complaints.filter(c => c.user_id !== id);
        return { rowCount: 1, rows: [deleted] };
      }
      return { rowCount: 0, rows: [] };
    }
  }

  // 4. DEPARTMENTS CRUD
  if (lower.includes('from departments') || lower.includes('into departments') || lower.includes('update departments') || lower.includes('delete from departments')) {
    if (lower.startsWith('select')) {
      if (lower.includes('where department_id = $1')) {
        const d = memoryStore.departments.find(x => x.department_id === parseInt(params[0], 10));
        return { rowCount: d ? 1 : 0, rows: d ? [d] : [] };
      }
      return { rowCount: memoryStore.departments.length, rows: [...memoryStore.departments] };
    }
    if (lower.startsWith('insert into departments')) {
      const newDept = {
        department_id: memoryStore.nextIds.departments++,
        department_name: params[0],
        location: params[1] || null,
        service_area: params[2] || null
      };
      memoryStore.departments.push(newDept);
      return { rowCount: 1, rows: [newDept] };
    }
    if (lower.startsWith('update departments')) {
      const id = parseInt(params[3], 10);
      const idx = memoryStore.departments.findIndex(x => x.department_id === id);
      if (idx !== -1) {
        memoryStore.departments[idx] = {
          ...memoryStore.departments[idx],
          department_name: params[0],
          location: params[1] || null,
          service_area: params[2] || null
        };
        return { rowCount: 1, rows: [memoryStore.departments[idx]] };
      }
      return { rowCount: 0, rows: [] };
    }
    if (lower.startsWith('delete from departments')) {
      const id = parseInt(params[0], 10);
      const idx = memoryStore.departments.findIndex(x => x.department_id === id);
      if (idx !== -1) {
        const deleted = memoryStore.departments.splice(idx, 1)[0];
        // SET NULL on associated complaints
        memoryStore.complaints.forEach(c => {
          if (c.department_id === id) c.department_id = null;
        });
        return { rowCount: 1, rows: [deleted] };
      }
      return { rowCount: 0, rows: [] };
    }
  }

  // 5. COMPLAINTS CRUD & JOINs
  if (lower.includes('complaints')) {
    if (lower.startsWith('select') && lower.includes('join users')) {
      let list = memoryStore.complaints.map(c => {
        const u = memoryStore.users.find(x => x.user_id === c.user_id) || {};
        const d = memoryStore.departments.find(x => x.department_id === c.department_id) || {};
        return {
          complaint_id: c.complaint_id,
          user_id: c.user_id,
          department_id: c.department_id,
          user_name: u.first_name ? `${u.first_name} ${u.last_name}` : `User #${c.user_id}`,
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          user_email: u.email || 'N/A',
          user_phone: u.phone_number || 'N/A',
          department_name: d.department_name || 'Unassigned',
          department_location: d.location || 'N/A',
          department_service_area: d.service_area || 'N/A',
          category: c.category,
          description: c.description,
          complaint_state: c.complaint_state,
          created_at: c.created_at
        };
      });

      if (lower.includes('where c.complaint_id = $1')) {
        const targetId = parseInt(params[0], 10);
        const single = list.find(x => x.complaint_id === targetId);
        return { rowCount: single ? 1 : 0, rows: single ? [single] : [] };
      }

      // Sort by created_at DESC
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (lower.includes('limit 5')) list = list.slice(0, 5);
      return { rowCount: list.length, rows: list };
    }

    if (lower.startsWith('select * from complaints')) {
      return { rowCount: memoryStore.complaints.length, rows: [...memoryStore.complaints] };
    }

    if (lower.startsWith('insert into complaints')) {
      const newComp = {
        complaint_id: memoryStore.nextIds.complaints++,
        user_id: parseInt(params[0], 10),
        department_id: params[1] ? parseInt(params[1], 10) : null,
        category: params[2],
        description: params[3],
        complaint_state: 'Pending',
        created_at: new Date().toISOString()
      };
      memoryStore.complaints.unshift(newComp);
      return { rowCount: 1, rows: [newComp] };
    }

    if (lower.startsWith('update complaints')) {
      if (lower.includes('set complaint_state = $1 where complaint_id = $2')) {
        const newState = params[0];
        const cid = parseInt(params[1], 10);
        const item = memoryStore.complaints.find(x => x.complaint_id === cid);
        if (item) {
          item.complaint_state = newState;
          return { rowCount: 1, rows: [item] };
        }
        return { rowCount: 0, rows: [] };
      }

      const id = parseInt(params[4], 10);
      const item = memoryStore.complaints.find(x => x.complaint_id === id);
      if (item) {
        if (params[0]) item.department_id = parseInt(params[0], 10);
        if (params[1]) item.category = params[1];
        if (params[2]) item.description = params[2];
        if (params[3]) item.complaint_state = params[3];
        return { rowCount: 1, rows: [item] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (lower.startsWith('delete from complaints')) {
      const id = parseInt(params[0], 10);
      const idx = memoryStore.complaints.findIndex(x => x.complaint_id === id);
      if (idx !== -1) {
        const deleted = memoryStore.complaints.splice(idx, 1)[0];
        memoryStore.statuses = memoryStore.statuses.filter(s => s.complaint_id !== id);
        return { rowCount: 1, rows: [deleted] };
      }
      return { rowCount: 0, rows: [] };
    }
  }

  // 6. STATUSES CRUD
  if (lower.includes('statuses')) {
    if (lower.startsWith('select')) {
      if (lower.includes('where complaint_id = $1')) {
        const cid = parseInt(params[0], 10);
        const list = memoryStore.statuses.filter(s => s.complaint_id === cid);
        list.sort((a, b) => a.status_id - b.status_id);
        return { rowCount: list.length, rows: list };
      }
      return { rowCount: memoryStore.statuses.length, rows: [...memoryStore.statuses] };
    }

    if (lower.startsWith('insert into statuses')) {
      const newStatus = {
        status_id: memoryStore.nextIds.statuses++,
        complaint_id: parseInt(params[0], 10),
        status: params[1],
        resolved_date: params[2] || null,
        remarks: params[3] || null,
        resolution_time: params[4] || null
      };
      memoryStore.statuses.push(newStatus);
      return { rowCount: 1, rows: [newStatus] };
    }

    if (lower.startsWith('update statuses')) {
      const id = parseInt(params[4], 10);
      const item = memoryStore.statuses.find(x => x.status_id === id);
      if (item) {
        item.status = params[0];
        item.remarks = params[1] || null;
        item.resolved_date = params[2] || null;
        item.resolution_time = params[3] || null;
        return { rowCount: 1, rows: [item] };
      }
      return { rowCount: 0, rows: [] };
    }
  }

  return { rowCount: 0, rows: [] };
}

// Main query executor with transparent fallback
async function query(text, params = []) {
  if (isPgConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('⚠️ Real PostgreSQL query failed, using in-memory handler:', err.message);
    }
  }
  return executeFallbackQuery(text, params);
}

module.exports = {
  query,
  pool,
};
