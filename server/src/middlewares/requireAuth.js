const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/response');

// 인증 미들웨어: 로그인이 필요한 API 앞에 둔다 (API 명세서 AUTH-03)
// 쿠키의 토큰 서명·만료만 검사하고 DB는 조회하지 않는다. 통과하면 req.userId에 사용자 ID(숫자)를 붙인다
// 쿠키 없음·서명 불일치·만료는 모두 401 UNAUTHORIZED 하나 (사용자 없음은 각 API가 조회해서 401)
function requireAuth(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return sendResponse(res, 401, 'UNAUTHORIZED');
  }

  let payload;
  try {
    // 토큰 헤더의 alg를 믿지 않고 서버가 서명한 방식(HS256)만 허용한다
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return sendResponse(res, 401, 'UNAUTHORIZED');
  }

  // next()는 try 밖에서 부른다: 뒤의 함수에서 난 에러까지 401로 바뀌지 않게
  req.userId = Number(payload.sub);
  return next();
}

module.exports = requireAuth;
