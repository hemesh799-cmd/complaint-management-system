const db = require('../db/connection');

// Get overview of all SQL tables with descriptions and current record counts
const getDatabaseTablesInfo = async (req, res, next) => {
  try {
    const usersCount = (await db.query('SELECT COUNT(*) FROM users')).rows[0].count;
    const deptsCount = (await db.query('SELECT COUNT(*) FROM departments')).rows[0].count;
    const complaintsCount = (await db.query('SELECT COUNT(*) FROM complaints')).rows[0].count;
    const statusesCount = (await db.query('SELECT COUNT(*) FROM statuses')).rows[0].count;

    const tables = [
      {
        table_name: 'users',
        description: 'Stores registered user profile records (students, staff, admin)',
        record_count: parseInt(usersCount, 10),
      },
      {
        table_name: 'departments',
        description: 'Stores complaint-handling college departments and locations',
        record_count: parseInt(deptsCount, 10),
      },
      {
        table_name: 'complaints',
        description: 'Stores submitted complaints with categories, state, and user/dept foreign keys',
        record_count: parseInt(complaintsCount, 10),
      },
      {
        table_name: 'statuses',
        description: 'Stores history logs of complaint status updates, remarks, and resolution details',
        record_count: parseInt(statusesCount, 10),
      },
    ];

    res.json({ success: true, database: process.env.DB_NAME || 'complaint_management', data: tables });
  } catch (error) {
    next(error);
  }
};

// Get raw users table records
const getUsersTableData = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY user_id ASC');
    res.json({ success: true, table: 'users', count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get raw departments table records
const getDepartmentsTableData = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY department_id ASC');
    res.json({ success: true, table: 'departments', count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get raw complaints table records
const getComplaintsTableData = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM complaints ORDER BY complaint_id ASC');
    res.json({ success: true, table: 'complaints', count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get raw statuses table records
const getStatusesTableData = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM statuses ORDER BY status_id ASC');
    res.json({ success: true, table: 'statuses', count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get table schema/structure metadata from PostgreSQL information_schema
const getTableSchema = async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const allowedTables = ['users', 'departments', 'complaints', 'statuses'];

    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({ success: false, error: 'Invalid table name' });
    }

    const schemaQuery = `
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length, 
        is_nullable, 
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position ASC;
    `;
    const result = await db.query(schemaQuery, [tableName]);

    res.json({ success: true, table: tableName, columns: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDatabaseTablesInfo,
  getUsersTableData,
  getDepartmentsTableData,
  getComplaintsTableData,
  getStatusesTableData,
  getTableSchema,
};
