const db = require('../db/connection');

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY user_id ASC');
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Create new user
const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone_number } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, error: 'First name, last name, and email are required' });
    }

    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone_number) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [first_name, last_name, email, phone_number || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone_number } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, error: 'First name, last name, and email are required' });
    }

    const result = await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4 
       WHERE user_id = $5 
       RETURNING *`,
      [first_name, last_name, email, phone_number || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
