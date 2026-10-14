// 성공·실패 모두 같은 모양으로 응답한다 (API 명세서 0-2)
// message는 항상 null: 화면 문구는 프론트가 code로 정한다
function sendResponse(res, status, code, data = null) {
  return res.status(status).json({ status, code, message: null, data });
}

module.exports = { sendResponse };
