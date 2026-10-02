const db = require('../db/db');

// GET /api/departments
async function getAllDepartments(req, res, next) {
  try {
    const queryText = `
      SELECT 
        d.department_id,
        d.department_name,
        d.location,
        d.service_area,
        COUNT(c.complaint_id)::int AS assigned_complaints
      FROM departments d
      LEFT JOIN complaints c ON d.department_id = c.department_id
      GROUP BY d.department_id, d.department_name, d.location, d.service_area
      ORDER BY d.department_id ASC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/departments/:id
async function getDepartmentById(req, res, next) {
  try {
    const { id } = req.params;
    const deptId = parseInt(id, 10);

    const deptRes = await db.query(`
      SELECT department_id, department_name, location, service_area
      FROM departments
      WHERE department_id = $1
    `, [deptId]);

    if (deptRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Department not found.' });
    }

    const complaintsRes = await db.query(`
      SELECT 
        c.complaint_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        c.category,
        c.description,
        s.status,
        c.complaint_date
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      JOIN statuses s ON c.status_id = s.status_id
      WHERE c.department_id = $1
      ORDER BY c.complaint_id DESC
    `, [deptId]);

    const deptObj = {
      ...deptRes.rows[0],
      assigned_complaints: complaintsRes.rows.length,
      complaints: complaintsRes.rows
    };

    res.json(deptObj);
  } catch (err) {
    next(err);
  }
}

// POST /api/departments
async function createDepartment(req, res, next) {
  try {
    const { department_name, location, service_area } = req.body;

    if (!department_name || !location || !service_area) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required: department_name, location, service_area.'
      });
    }

    const queryText = `
      INSERT INTO departments (department_name, location, service_area)
      VALUES ($1, $2, $3)
      RETURNING department_id, department_name, location, service_area
    `;

    const result = await db.query(queryText, [department_name, location, service_area]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment
};
