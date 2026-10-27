const express = require('express');
const { signup, login } = require('../controllers/authController');

// /api/auth 아래 주소 (app.js에서 붙인다)
const router = express.Router();

router.post('/signup', signup); // AUTH-01
router.post('/login', login); // AUTH-02

module.exports = router;
