const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analytics.controller');

// Route to get dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
