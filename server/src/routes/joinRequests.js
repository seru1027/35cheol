const express = require('express');
const { createJoinRequest } = require('../controllers/joinController');
const requireAuth = require('../middlewares/requireAuth');

// /api/join-requests 아래 주소 (app.js에서 붙인다)
// URL에 조직 ID가 없어 orgs 라우터와 따로 둔다. 로그인은 필요하다
const router = express.Router();

router.use(requireAuth);

router.post('/', createJoinRequest); // JOIN-02

module.exports = router;
