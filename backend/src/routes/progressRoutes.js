const express = require('express');
const {
  getProgressOverview,
  getBodyweightProgress,
  getVolumeProgress,
  getStrengthProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/overview', getProgressOverview);
router.get('/bodyweight', getBodyweightProgress);
router.get('/volume', getVolumeProgress);
router.get('/strength', getStrengthProgress);

module.exports = router;
