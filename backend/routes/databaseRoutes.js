const express = require('express');
const router = express.Router();
const {
  getDatabaseTablesInfo,
  getUsersTableData,
  getDepartmentsTableData,
  getComplaintsTableData,
  getStatusesTableData,
  getTableSchema,
} = require('../controllers/databaseController');

router.get('/tables', getDatabaseTablesInfo);
router.get('/users', getUsersTableData);
router.get('/departments', getDepartmentsTableData);
router.get('/complaints', getComplaintsTableData);
router.get('/statuses', getStatusesTableData);
router.get('/schema/:tableName', getTableSchema);

module.exports = router;
