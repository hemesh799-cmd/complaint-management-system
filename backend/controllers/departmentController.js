const db = require('../db/connection');

// Get all departments
const getDepartments = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY department_id ASC');
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get single department by ID
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM departments WHERE department_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Create new department
const createDepartment = async (req, res, next) => {
  try {
    const { department_name, location, service_area } = req.body;
    if (!department_name) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }

    const result = await db.query(
      `INSERT INTO departments (department_name, location, service_area) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [department_name, location || null, service_area || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update department
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department_name, location, service_area } = req.body;

    if (!department_name) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }

    const result = await db.query(
      `UPDATE departments 
       SET department_name = $1, location = $2, service_area = $3 
       WHERE department_id = $4 
       RETURNING *`,
      [department_name, location || null, service_area || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM departments WHERE department_id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    res.json({ success: true, message: 'Department deleted successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
