const db = require('../db/db');

// GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const queryText = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        (u.first_name || ' ' || u.last_name) AS name,
        u.email,
        u.phone_number,
        COUNT(c.complaint_id)::int AS total_complaints
      FROM users u
      LEFT JOIN complaints c ON u.user_id = c.user_id
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone_number
      ORDER BY u.user_id ASC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    const userRes = await db.query(`
      SELECT user_id, first_name, last_name, (first_name || ' ' || last_name) AS name, email, phone_number
      FROM users
      WHERE user_id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    const complaintsRes = await db.query(`
      SELECT 
        c.complaint_id,
        c.category,
        c.description,
        d.department_name,
        s.status,
        c.complaint_date,
        c.resolved_date,
        c.remarks
      FROM complaints c
      JOIN departments d ON c.department_id = d.department_id
      JOIN statuses s ON c.status_id = s.status_id
      WHERE c.user_id = $1
      ORDER BY c.complaint_id DESC
    `, [userId]);

    const userObj = {
      ...userRes.rows[0],
      total_complaints: complaintsRes.rows.length,
      complaints: complaintsRes.rows
    };

    res.json(userObj);
  } catch (err) {
    next(err);
  }
}

// POST /api/users
async function createUser(req, res, next) {
  try {
    const { first_name, last_name, email, phone_number } = req.body;

    if (!first_name || !last_name || !email || !phone_number) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required: first_name, last_name, email, phone_number.'
      });
    }

    const queryText = `
      INSERT INTO users (first_name, last_name, email, phone_number)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, first_name, last_name, (first_name || ' ' || last_name) AS name, email, phone_number
    `;

    const result = await db.query(queryText, [first_name, last_name, email, phone_number]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};
