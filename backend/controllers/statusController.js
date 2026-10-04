const db = require('../db/connection');

// Get status history for a complaint
const getStatusesByComplaintId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM statuses WHERE complaint_id = $1 ORDER BY status_id ASC',
      [id]
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Add new status for a complaint
const addStatus = async (req, res, next) => {
  try {
    const { id: complaint_id } = req.params;
    const { status, remarks, resolved_date, resolution_time } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Check if complaint exists
    const checkComplaint = await db.query('SELECT complaint_id FROM complaints WHERE complaint_id = $1', [complaint_id]);
    if (checkComplaint.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Insert new status record
    const insertQuery = `
      INSERT INTO statuses (complaint_id, status, resolved_date, remarks, resolution_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      complaint_id,
      status,
      resolved_date || null,
      remarks || null,
      resolution_time || null,
    ]);

    // Automatically sync/update main complaint_state in complaints table
    await db.query(
      'UPDATE complaints SET complaint_state = $1 WHERE complaint_id = $2',
      [status, complaint_id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update an existing status record
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks, resolved_date, resolution_time } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updateQuery = `
      UPDATE statuses
      SET status = $1, remarks = $2, resolved_date = $3, resolution_time = $4
      WHERE status_id = $5
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [
      status,
      remarks || null,
      resolved_date || null,
      resolution_time || null,
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Status record not found' });
    }

    const updatedStatus = result.rows[0];

    // Sync state to parent complaint
    await db.query(
      'UPDATE complaints SET complaint_state = $1 WHERE complaint_id = $2',
      [status, updatedStatus.complaint_id]
    );

    res.json({ success: true, data: updatedStatus });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatusesByComplaintId,
  addStatus,
  updateStatus,
};
