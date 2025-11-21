const express = require('express');
const { fetchFeedback, getEventAverageRating } = require('./feedbackController');

const router = express.Router();

router.get('/feedback/details', fetchFeedback);
router.get('/feedback/average', getEventAverageRating);

module.exports = router;
