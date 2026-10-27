const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');

// 멤버십 미들웨어 (API 명세서 0-4 조직 API 공통 에러의 '멤버십', ORG-03에서 처음 만듦)
// requireAuth(req.userId)와 checkIds(req.orgId) 뒤에 둔다
// ACTIVE만 통과, PENDING은 403, 나머지(행 없음·REJECTED 등)는 모두 404
async function requireMembership(req, res, next) {
  // (user_id, org_id)가 UNIQUE라 결과는 최대 1행 (ERD memberships)
  const [rows] = await pool.query(
    'SELECT id, role, status FROM memberships WHERE user_id = ? AND org_id = ?',
    [req.userId, req.orgId],
  );
  const membership = rows[0];

  if (membership && membership.status === 'PENDING') {
    return sendResponse(res, 403, 'MEMBERSHIP_PENDING');
  }

  // 없는 조직과 내가 회원이 아닌 조직을 같은 404로: 남의 조직이 있는지 없는지 알려주지 않는다
  if (!membership || membership.status !== 'ACTIVE') {
    return sendResponse(res, 404, 'ORG_NOT_FOUND');
  }

  // 이후 역할 검사와 각 API가 쓴다
  req.membership = membership;
  return next();
}

module.exports = requireMembership;
