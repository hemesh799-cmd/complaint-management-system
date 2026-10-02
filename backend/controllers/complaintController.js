const db = require('../db/db');

// Helper to construct base SQL JOIN query for complaints
const BASE_COMPLAINT_QUERY = `
  SELECT 
    c.complaint_id,
    c.user_id,
    u.first_name,
    u.last_name,
    (u.first_name || ' ' || u.last_name) AS user_name,
    u.email AS user_email,
    u.phone_number AS user_phone,
    c.category,
    c.description,
    c.department_id,
    d.department_name,
    d.location AS department_location,
    d.service_area,
    c.status_id,
    s.status,
    c.complaint_date,
    c.resolved_date,
    c.remarks,
    CASE 
      WHEN c.resolved_date IS NOT NULL THEN
        ROUND((EXTRACT(EPOCH FROM (c.resolved_date - c.complaint_date)) / 3600.0)::numeric, 1) || ' hours'
      ELSE NULL
    END AS resolution_time
  FROM complaints c
  JOIN users u ON c.user_id = u.user_id
  JOIN departments d ON c.department_id = d.department_id
  JOIN statuses s ON c.status_id = s.status_id
`;

// GET /api/complaints
async function getAllComplaints(req, res, next) {
  try {
    const { status, department_id, category, search } = req.query;
    let queryText = BASE_COMPLAINT_QUERY + ' WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status && status !== 'All') {
      queryText += ` AND LOWER(s.status) = LOWER($${paramIdx})`;
      params.push(status);
      paramIdx++;
    }

    if (department_id && department_id !== 'All') {
      queryText += ` AND c.department_id = $${paramIdx}`;
      params.push(parseInt(department_id, 10));
      paramIdx++;
    }

    if (category && category !== 'All') {
      queryText += ` AND LOWER(c.category) = LOWER($${paramIdx})`;
      params.push(category);
      paramIdx++;
    }

    if (search) {
      queryText += ` AND (
        CAST(c.complaint_id AS TEXT) ILIKE $${paramIdx} OR
        u.first_name ILIKE $${paramIdx} OR
        u.last_name ILIKE $${paramIdx} OR
        c.category ILIKE $${paramIdx} OR
        c.description ILIKE $${paramIdx} OR
        d.department_name ILIKE $${paramIdx}
      )`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    queryText += ' ORDER BY c.complaint_id DESC';

    const result = await db.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id
async function getComplaintById(req, res, next) {
  try {
    const { id } = req.params;
    const queryText = `${BASE_COMPLAINT_QUERY} WHERE c.complaint_id = $1`;
    const result = await db.query(queryText, [parseInt(id, 10)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Complaint not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints
async function createComplaint(req, res, next) {
  try {
    const { user_id, department_id, status_id, category, description } = req.body;

    if (!user_id || !department_id || !category || !description) {
      return res.status(400).json({
        error: true,
        message: 'Required fields missing: user_id, department_id, category, description are required.'
      });
    }

    const initialStatusId = status_id || 1; // Default to Pending (status_id = 1)

    const insertQuery = `
      INSERT INTO complaints (user_id, department_id, status_id, category, description, complaint_date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING complaint_id
    `;

    const insertRes = await db.query(insertQuery, [
      parseInt(user_id, 10),
      parseInt(department_id, 10),
      parseInt(initialStatusId, 10),
      category,
      description
    ]);

    const newId = insertRes.rows[0].complaint_id;

    // Fetch complete newly created complaint record with JOINs
    const fetchQuery = `${BASE_COMPLAINT_QUERY} WHERE c.complaint_id = $1`;
    const fullRecord = await db.query(fetchQuery, [newId]);

    res.status(201).json(fullRecord.rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/complaints/:id
async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { category, description, department_id, status_id, remarks } = req.body;

    const complaintId = parseInt(id, 10);

    // Check if complaint exists
    const checkRes = await db.query('SELECT status_id, resolved_date FROM complaints WHERE complaint_id = $1', [complaintId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Complaint not found.' });
    }

    const existing = checkRes.rows[0];

    // Determine resolved_date
    // Status ID 3 corresponds to 'Resolved'
    let resolvedDateToSet = existing.resolved_date;
    if (parseInt(status_id, 10) === 3 && !existing.resolved_date) {
      resolvedDateToSet = new Date();
    } else if (parseInt(status_id, 10) !== 3) {
      resolvedDateToSet = null;
    }

    const updateQuery = `
      UPDATE complaints
      SET category = COALESCE($1, category),
          description = COALESCE($2, description),
          department_id = COALESCE($3, department_id),
          status_id = COALESCE($4, status_id),
          remarks = $5,
          resolved_date = $6
      WHERE complaint_id = $7
      RETURNING complaint_id
    `;

    await db.query(updateQuery, [
      category || null,
      description || null,
      department_id ? parseInt(department_id, 10) : null,
      status_id ? parseInt(status_id, 10) : null,
      remarks !== undefined ? remarks : null,
      resolvedDateToSet,
      complaintId
    ]);

    // Fetch updated record with JOINs
    const fullRecord = await db.query(`${BASE_COMPLAINT_QUERY} WHERE c.complaint_id = $1`, [complaintId]);
    res.json(fullRecord.rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/complaints/:id
async function deleteComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const complaintId = parseInt(id, 10);

    const deleteRes = await db.query('DELETE FROM complaints WHERE complaint_id = $1 RETURNING complaint_id', [complaintId]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: `Complaint #${complaintId} has been successfully deleted from the database.`,
      complaint_id: complaintId
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint
};
