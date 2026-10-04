const express = require('express');
const router = express.Router();
const { updateStatus } = require('../controllers/statusController');

router.put('/:id', updateStatus);

module.exports = router;
