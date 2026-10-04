const db = require('../db/connection');

// Get dashboard aggregate statistics and recent complaints
const getDashboardData = async (req, res, next) => {
  try {
    // 1. Total Users Count
    const usersCountRes = await db.query('SELECT COUNT(*) AS count FROM users');
    const totalUsers = parseInt(usersCountRes.rows[0].count, 10);

    // 2. Total Complaints Count
    const complaintsCountRes = await db.query('SELECT COUNT(*) AS count FROM complaints');
    const totalComplaints = parseInt(complaintsCountRes.rows[0].count, 10);

    // 3. Pending Complaints Count
    const pendingRes = await db.query("SELECT COUNT(*) AS count FROM complaints WHERE complaint_state = 'Pending'");
    const pendingComplaints = parseInt(pendingRes.rows[0].count, 10);

    // 4. In Progress Complaints Count
    const inProgressRes = await db.query("SELECT COUNT(*) AS count FROM complaints WHERE complaint_state = 'In Progress'");
    const inProgressComplaints = parseInt(inProgressRes.rows[0].count, 10);

    // 5. Resolved Complaints Count
    const resolvedRes = await db.query("SELECT COUNT(*) AS count FROM complaints WHERE complaint_state = 'Resolved'");
    const resolvedComplaints = parseInt(resolvedRes.rows[0].count, 10);

    // 6. Rejected Complaints Count
    const rejectedRes = await db.query("SELECT COUNT(*) AS count FROM complaints WHERE complaint_state = 'Rejected'");
    const rejectedComplaints = parseInt(rejectedRes.rows[0].count, 10);

    // 7. Total Departments Count
    const deptsCountRes = await db.query('SELECT COUNT(*) AS count FROM departments');
    const totalDepartments = parseInt(deptsCountRes.rows[0].count, 10);

    // 8. Recent Complaints (Last 5 complaints)
    const recentComplaintsQuery = `
      SELECT 
        c.complaint_id,
        u.first_name || ' ' || u.last_name AS user_name,
        COALESCE(d.department_name, 'Unassigned') AS department_name,
        c.category,
        c.description,
        c.complaint_state,
        c.created_at
      FROM complaints c
      JOIN users u ON c.user_id = u.user_id
      LEFT JOIN departments d ON c.department_id = d.department_id
      ORDER BY c.created_at DESC
      LIMIT 5;
    `;
    const recentComplaintsRes = await db.query(recentComplaintsQuery);

    res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_complaints: totalComplaints,
        pending_complaints: pendingComplaints,
        in_progress_complaints: inProgressComplaints,
        resolved_complaints: resolvedComplaints,
        rejected_complaints: rejectedComplaints,
        total_departments: totalDepartments,
      },
      recentComplaints: recentComplaintsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};
