const db = require('../db/db');

// GET /api/dashboard/stats
async function getDashboardStats(req, res, next) {
  try {
    // 1. Total Users
    const usersCountRes = await db.query('SELECT COUNT(*)::int AS count FROM users');
    const totalUsers = usersCountRes.rows[0].count;

    // 2. Total Complaints
    const complaintsCountRes = await db.query('SELECT COUNT(*)::int AS count FROM complaints');
    const totalComplaints = complaintsCountRes.rows[0].count;

    // 3. Status breakdown
    const statusCountsRes = await db.query(`
      SELECT 
        s.status,
        COUNT(c.complaint_id)::int AS count
      FROM statuses s
      LEFT JOIN complaints c ON s.status_id = c.status_id
      GROUP BY s.status, s.status_id
      ORDER BY s.status_id ASC
    `);

    let pendingComplaints = 0;
    let inProgressComplaints = 0;
    let resolvedComplaints = 0;
    let rejectedComplaints = 0;

    statusCountsRes.rows.forEach(row => {
      const s = row.status.toLowerCase();
      if (s === 'pending') pendingComplaints = row.count;
      else if (s === 'in progress') inProgressComplaints = row.count;
      else if (s === 'resolved') resolvedComplaints = row.count;
      else if (s === 'rejected') rejectedComplaints = row.count;
    });

    // 4. Department breakdown
    const deptStatsRes = await db.query(`
      SELECT 
        d.department_name,
        COUNT(c.complaint_id)::int AS count
      FROM departments d
      LEFT JOIN complaints c ON d.department_id = c.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY count DESC
    `);

    // 5. Category breakdown
    const categoryStatsRes = await db.query(`
      SELECT 
        category,
        COUNT(complaint_id)::int AS count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
      LIMIT 6
    `);

    // 6. Recent Complaints
    const recentRes = await db.query(`
      SELECT 
        c.complaint_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        c.category,
        d.department_name,
        s.status,
        c.complaint_date
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN statuses s ON c.status_id = s.status_id
      ORDER BY c.complaint_id DESC
      LIMIT 5
    `);

    // 7. Recent Resolved Complaints
    const resolvedRes = await db.query(`
      SELECT 
        c.complaint_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        c.category,
        d.department_name,
        c.remarks,
        c.resolved_date,
        ROUND((EXTRACT(EPOCH FROM (c.resolved_date - c.complaint_date)) / 3600.0)::numeric, 1) || ' hours' AS resolution_time
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      JOIN departments d ON c.department_id = d.department_id
      WHERE c.resolved_date IS NOT NULL
      ORDER BY c.resolved_date DESC
      LIMIT 5
    `);

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      departmentStats: deptStatsRes.rows,
      categoryStats: categoryStatsRes.rows,
      recentComplaints: recentRes.rows,
      recentResolvedComplaints: resolvedRes.rows
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats
};
