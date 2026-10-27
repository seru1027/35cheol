const express = require('express');
const { createOrg, getMyOrgs } = require('../controllers/orgController');
const requireAuth = require('../middlewares/requireAuth');

// /api/orgs 아래 주소 (app.js에서 붙인다)
const router = express.Router();

// 조직 API는 모두 로그인이 필요하다: 라우터 맨 위에서 한 번 건다 (API 명세서 0-4 조직 API 공통 에러의 첫 검사)
router.use(requireAuth);

router.post('/', createOrg); // ORG-01
router.get('/', getMyOrgs); // ORG-02

module.exports = router;
