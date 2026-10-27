const { sendResponse } = require('../utils/response');

// 역할 미들웨어 (API 명세서 0-4 조직 API 공통 에러의 '역할', JOIN-01에서 처음 만듦)
// API마다 허용 역할이 달라서, 허용 역할 목록을 받아 미들웨어를 만들어 돌려준다
// 예: router.post('/:orgId/invite-code', orgMember, requireRole('OWNER', 'ADMIN'), createInviteCode)
// requireMembership 뒤에 둔다 (req.membership.role을 읽음)
function requireRole(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!allowedRoles.includes(req.membership.role)) {
      return sendResponse(res, 403, 'INSUFFICIENT_ROLE');
    }
    return next();
  };
}

module.exports = requireRole;
