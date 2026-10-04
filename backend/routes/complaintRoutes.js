const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');

const {
  getStatusesByComplaintId,
  addStatus,
} = require('../controllers/statusController');

// Complaint CRUD routes
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

// Status sub-routes for complaints
router.get('/:id/statuses', getStatusesByComplaintId);
router.post('/:id/statuses', addStatus);

module.exports = router;
