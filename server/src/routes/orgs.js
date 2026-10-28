const express = require('express');
const {
  createOrg, getMyOrgs, getOrg, getMembers,
} = require('../controllers/orgController');
const requireAuth = require('../middlewares/requireAuth');
const checkIds = require('../middlewares/checkIds');
const requireMembership = require('../middlewares/requireMembership');
const requireRole = require('../middlewares/requireRole');
const {
  createInviteCode, getInviteCode, getJoinRequests, approveJoinRequest,
} = require('../controllers/joinController');

// /api/orgs 아래 주소 (app.js에서 붙인다)
const router = express.Router();

// 조직 API는 모두 로그인이 필요하다: 라우터 맨 위에서 한 번 건다 (API 명세서 0-4 조직 API 공통 에러의 첫 검사)
router.use(requireAuth);

// URL에 조직 ID가 있는 API의 공통 검사: ID 형식 → 멤버십 (API 명세서 0-4)
// router.use가 아니라 라우트마다 끼운다: 라우트에 맞춰진 뒤라야 URL의 모든 ID(:noticeId 등)를 DB 전에 검사할 수 있다
const orgMember = [checkIds, requireMembership];

router.post('/', createOrg); // ORG-01
router.get('/', getMyOrgs); // ORG-02
router.get('/:orgId', orgMember, getOrg); // ORG-03
router.get('/:orgId/members', orgMember, getMembers); // MEMBER-01: 역할 검사 없음, 역할에 따라 항목이 다름

// 회장·운영진 전용: 멤버십 검사 다음에 역할 검사
const ownerOrAdmin = requireRole('OWNER', 'ADMIN');
router.post('/:orgId/invite-code', orgMember, ownerOrAdmin, createInviteCode); // JOIN-01 발급
router.get('/:orgId/invite-code', orgMember, ownerOrAdmin, getInviteCode); // JOIN-01 조회
router.get('/:orgId/join-requests', orgMember, ownerOrAdmin, getJoinRequests); // JOIN-03
// JOIN-04: checkIds가 조직 ID 다음에 membershipId 형식도 검사한다
router.post('/:orgId/join-requests/:membershipId/approve', orgMember, ownerOrAdmin, approveJoinRequest);

module.exports = router;
