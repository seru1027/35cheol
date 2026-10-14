const { sendResponse } = require('../utils/response');

// 어디서 난 에러든 받아서 같은 모양의 JSON으로 바꾼다 (API 명세서 0-4)
// 인자가 4개여야 Express가 에러 처리 함수로 알아본다. 맨 끝에 둔다
function errorHandler(err, req, res, next) {
  // 응답을 이미 보내기 시작했으면 바꿀 수 없으니 Express 기본 처리(연결 끊기)에 맡긴다
  if (res.headersSent) {
    return next(err);
  }

  // JSON 문법 오류 (express.json()이 body를 해석하다 실패)
  if (err.type === 'entity.parse.failed') {
    return sendResponse(res, 400, 'INVALID_JSON');
  }

  // 그 밖의 요청 오류(4xx)는 원래 상태 코드를 유지한다: 요청한 쪽 잘못을 500으로 바꾸지 않는다
  const status = err.status;
  if (status === 413) {
    return sendResponse(res, 413, 'PAYLOAD_TOO_LARGE');
  }
  if (status === 415) {
    return sendResponse(res, 415, 'UNSUPPORTED_MEDIA_TYPE');
  }
  if (status >= 400 && status < 500) {
    return sendResponse(res, status, 'BAD_REQUEST');
  }

  // 상태 코드가 없거나 5xx: 서버 잘못. 원인은 서버 로그에만 남기고 응답에는 담지 않는다
  console.error(err);
  return sendResponse(res, 500, 'INTERNAL_SERVER_ERROR');
}

module.exports = errorHandler;
