const { sendResponse } = require('../utils/response');

// URL의 ID 형식 검사 (API 명세서 0-4 조직 API 공통 에러의 'ID 형식')
// 1 이상의 정수만 통과. Number()로 바꿔 검사하면 01·1e3·+1·' 1'·1.0이 통과하므로 문자열 그대로 정규식으로 본다
const ID_PATTERN = /^[1-9][0-9]*$/;

// 검사 순서: 조직 ID가 먼저, 그다음 URL에 있는 ID. 틀리면 그 ID의 코드로 400
const ID_PARAMS = [
  { param: 'orgId', code: 'INVALID_ORG_ID' },
  { param: 'membershipId', code: 'INVALID_MEMBERSHIP_ID' },
  { param: 'noticeId', code: 'INVALID_NOTICE_ID' },
];

// DB를 읽기 전에 URL의 ID를 모두 한 번에 검사한다. 그래서 회원이 아닌 조직의 /notices/abc도 404가 아니라 400
// 통과하면 숫자로 바꿔 req.orgId, req.membershipId, req.noticeId에 붙인다
function checkIds(req, res, next) {
  for (const { param, code } of ID_PARAMS) {
    const value = req.params[param];
    if (value === undefined) continue; // 이 주소에 없는 ID

    if (!ID_PATTERN.test(value)) {
      return sendResponse(res, 400, code);
    }
    req[param] = Number(value);
  }
  return next();
}

module.exports = checkIds;
