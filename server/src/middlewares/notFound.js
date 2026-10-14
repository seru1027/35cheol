const { sendResponse } = require('../utils/response');

// 어느 라우터에도 맞지 않은 요청: 없는 주소, 또는 주소는 있지만 그 Method가 없음 (API 명세서 0-4)
// 모든 라우터 뒤, 에러 처리 함수 앞에 둔다
function notFound(req, res) {
  sendResponse(res, 404, 'NOT_FOUND');
}

module.exports = notFound;
