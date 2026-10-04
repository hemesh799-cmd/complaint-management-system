const db = require('../db/connection');

// Get all complaints with user and department details using SQL JOIN
const getComplaints = async (req, res, next) => {
  try {
    const queryText = `
      SELECT 
        c.complaint_id,
        c.user_id,
        c.department_id,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        u.phone_number AS user_phone,
        COALESCE(d.department_name, 'Unassigned') AS department_name,
        c.category,
        c.description,
        c.complaint_state,
        c.created_at
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      LEFT JOIN departments d ON c.department_id = d.department_id
      ORDER BY c.created_at DESC;
    `;
    const result = await db.query(queryText);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get single complaint with detailed user, department, and status history
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaintQuery = `
      SELECT 
        c.complaint_id,
        c.user_id,
        c.department_id,
        u.first_name || ' ' || u.last_name AS user_name,
        u.first_name,
        u.last_name,
        u.email AS user_email,
        u.phone_number AS user_phone,
        COALESCE(d.department_name, 'Unassigned') AS department_name,
        d.location AS department_location,
        d.service_area AS department_service_area,
        c.category,
        c.description,
        c.complaint_state,
        c.created_at
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      LEFT JOIN departments d ON c.department_id = d.department_id
      WHERE c.complaint_id = $1;
    `;
    const complaintResult = await db.query(complaintQuery, [id]);

    if (complaintResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const complaint = complaintResult.rows[0];

    // Fetch status history for this complaint
    const statusQuery = `
      SELECT status_id, complaint_id, status, resolved_date, remarks, resolution_time
      FROM statuses
      WHERE complaint_id = $1
      ORDER BY status_id ASC;
    `;
    const statusResult = await db.query(statusQuery, [id]);
    complaint.statuses = statusResult.rows;

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// Create a new complaint
const createComplaint = async (req, res, next) => {
  try {
    const { user_id, department_id, category, description } = req.body;

    if (!user_id || !category || !description) {
      return res.status(400).json({
        success: false,
        error: 'User ID, Category, and Description are required',
      });
    }

    // Insert complaint into PostgreSQL
    const insertComplaintQuery = `
      INSERT INTO complaints (user_id, department_id, category, description, complaint_state)
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING *;
    `;
    const complaintResult = await db.query(insertComplaintQuery, [
      user_id,
      department_id || null,
      category,
      description,
    ]);

    const newComplaint = complaintResult.rows[0];

    // Create initial status record in statuses table
    const insertStatusQuery = `
      INSERT INTO statuses (complaint_id, status, remarks)
      VALUES ($1, 'Pending', 'Complaint registered successfully');
    `;
    await db.query(insertStatusQuery, [newComplaint.complaint_id]);

    res.status(201).json({ success: true, data: newComplaint });
  } catch (error) {
    next(error);
  }
};

// Update complaint
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department_id, category, description, complaint_state } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        error: 'Category and Description are required',
      });
    }

    const updateQuery = `
      UPDATE complaints
      SET department_id = $1, category = $2, description = $3, complaint_state = COALESCE($4, complaint_state)
      WHERE complaint_id = $5
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [
      department_id || null,
      category,
      description,
      complaint_state || null,
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete complaint
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM complaints WHERE complaint_id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.json({ success: true, message: 'Complaint deleted successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
};
