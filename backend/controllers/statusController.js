const db = require('../db/db');

// GET /api/statuses
async function getAllStatuses(req, res, next) {
  try {
    const result = await db.query('SELECT status_id, status FROM statuses ORDER BY status_id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStatuses
};
