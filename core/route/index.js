// routes/index.js
const express = require('express');
const router = express.Router();

const { handleSearchRoute } = require('../../core/carousel/function'); // Adjust the path

// Include the search route
router.post('/search', handleSearchRoute);

module.exports = router;
