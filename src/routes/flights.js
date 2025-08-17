const express = require('express');
const { searchFlights } = require('../controllers/flightController.js');
const verifyToken = require('../middlewares/verifyToken.js');

const router = express.Router();

router.post('/search', verifyToken, searchFlights);

module.exports = router;