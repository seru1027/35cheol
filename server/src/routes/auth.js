const express = require('express');
const { signup, login, me, logout } = require('../controllers/authController');
const requireAuth = require('../middlewares/requireAuth');

// /api/auth 아래 주소 (app.js에서 붙인다)
const router = express.Router();

router.post('/signup', signup); // AUTH-01
router.post('/login', login); // AUTH-02
router.get('/me', requireAuth, me); // AUTH-03: 인증 미들웨어를 거친 뒤 me
router.post('/logout', logout); // AUTH-04: 로그인 필요 없음 (401 없음)

module.exports = router;
