const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');
const { validateString } = require('../utils/validate');

// bcrypt 해시 강도 (1 올릴 때마다 시간 2배). AUTH-02의 가짜 해시도 이 값으로 만든다 (API 명세서 AUTH-02)
const BCRYPT_COST = 10;

// 없는 아이디로 로그인할 때 비교할 가짜 해시. 실제 해시와 같은 cost의 유효한 bcrypt 해시여야
// 비교 시간이 같아진다 (API 명세서 AUTH-02). 서버 시작 때 한 번만 만든다
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_COST);

// Access Token 유효 시간 30분: 토큰 만료(exp)와 쿠키 Max-Age를 같게 둔다
const ACCESS_TOKEN_MINUTES = 30;

// 토큰 쿠키 옵션. 로그아웃도 같은 옵션이어야 브라우저가 같은 쿠키로 보고 지운다 (API 명세서 AUTH-04)
const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true, // JS(document.cookie)로 읽을 수 없음
  sameSite: 'lax', // 다른 사이트에서 보내는 POST 등에는 실리지 않음
  secure: process.env.NODE_ENV === 'production', // 배포(HTTPS)에서만. localhost는 HTTP
  path: '/',
};

// AUTH-01 회원가입
async function signup(req, res) {
  // 검사는 명세의 body 순서(loginId → name → password)로, 처음 걸린 하나만 응답한다 (API 명세서 0-3)
  const loginId = validateString(req.body.loginId, {
    field: 'LOGIN_ID', min: 4, max: 20, pattern: /^[a-z0-9]+$/, lowercase: true,
  });
  if (loginId.code) return sendResponse(res, 400, loginId.code);

  const name = validateString(req.body.name, { field: 'NAME', min: 1, max: 20 });
  if (name.code) return sendResponse(res, 400, name.code);

  // 비밀번호는 앞뒤 공백을 지우지 않는다 (API 명세서 0-1 예외). 아스키 33~126번만
  const password = validateString(req.body.password, {
    field: 'PASSWORD', min: 8, max: 64, pattern: /^[\x21-\x7E]+$/, trim: false,
  });
  if (password.code) return sendResponse(res, 400, password.code);

  // 원문은 저장하지 않고 해시만 저장한다
  const passwordHash = await bcrypt.hash(password.value, BCRYPT_COST);

  // 중복은 미리 조회하지 않고 UNIQUE 위반(1062)을 409로 바꾼다: 동시에 가입해도 1건만 성공 (ERD 0-3)
  let result;
  try {
    [result] = await pool.query(
      'INSERT INTO users (login_id, name, password_hash) VALUES (?, ?, ?)',
      [loginId.value, name.value, passwordHash],
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return sendResponse(res, 409, 'LOGIN_ID_ALREADY_EXISTS');
    }
    throw err; // 그 밖의 DB 에러는 에러 처리 함수가 500으로 바꾼다
  }

  return sendResponse(res, 201, 'SIGNUP_SUCCESS', {
    userId: result.insertId,
    loginId: loginId.value,
    name: name.value,
  });
}

// AUTH-02 로그인
async function login(req, res) {
  // 아이디·비밀번호 모두 필수값과 문자열 타입만 검사한다. 형식이 틀린 아이디는 어차피 조회에 실패해 401
  const loginId = validateString(req.body.loginId, { field: 'LOGIN_ID', lowercase: true });
  if (loginId.code) return sendResponse(res, 400, loginId.code);

  // 비밀번호는 공백을 지우지 않고 원문 그대로 비교한다. 공백뿐인 값도 그대로 비교해 401
  const password = validateString(req.body.password, { field: 'PASSWORD', trim: false });
  if (password.code) return sendResponse(res, 400, password.code);

  const [rows] = await pool.query(
    'SELECT id, login_id, name, password_hash FROM users WHERE login_id = ?',
    [loginId.value],
  );
  const user = rows[0];

  // 아이디가 없어도 가짜 해시로 비교해 두 경우의 응답 시간을 맞춘다.
  // 아이디 미존재와 비밀번호 불일치는 같은 코드: "아이디는 맞았다"는 힌트를 주지 않는다
  const isMatch = await bcrypt.compare(password.value, user ? user.password_hash : DUMMY_HASH);
  if (!user || !isMatch) {
    return sendResponse(res, 401, 'INVALID_LOGIN_ID_OR_PASSWORD');
  }

  // 토큰 내용은 사용자 ID만 (sub: JWT 표준 '주인' 항목, 문자열). body에는 담지 않고 쿠키로만 보낸다
  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: `${ACCESS_TOKEN_MINUTES}m`,
  });
  res.cookie('access_token', token, {
    ...ACCESS_TOKEN_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MINUTES * 60 * 1000, // Express는 ms로 받아 Max-Age=1800(초)로 보낸다
  });

  // 응답 data는 AUTH-03 내 정보 조회와 같은 모양
  return sendResponse(res, 200, 'LOGIN_SUCCESS', {
    userId: user.id,
    loginId: user.login_id,
    name: user.name,
  });
}

// AUTH-03 내 정보 조회 (requireAuth 뒤에서 실행되어 req.userId가 있다)
async function me(req, res) {
  const [rows] = await pool.query(
    'SELECT id, login_id, name FROM users WHERE id = ?',
    [req.userId],
  );
  const user = rows[0];

  // 토큰은 유효하지만 사용자가 없음 → 다른 401과 같은 코드
  if (!user) {
    return sendResponse(res, 401, 'UNAUTHORIZED');
  }

  return sendResponse(res, 200, 'GET_ME_SUCCESS', {
    userId: user.id,
    loginId: user.login_id,
    name: user.name,
  });
}

// AUTH-04 로그아웃: 인증 미들웨어를 거치지 않는다. 쿠키가 없거나 만료돼도 결과가 같으므로 성공 (멱등성)
// 서버에 저장된 토큰이 없어 지울 것은 쿠키뿐이다. 이미 복사된 토큰은 30분 만료까지 유효 (범위 밖)
function logout(req, res) {
  // Express는 Max-Age=0 대신 Expires=Thu, 01 Jan 1970 00:00:00 GMT로 보낸다. 둘 다 브라우저가 지운다
  res.clearCookie('access_token', ACCESS_TOKEN_COOKIE_OPTIONS);
  return sendResponse(res, 200, 'LOGOUT_SUCCESS');
}

module.exports = { signup, login, me, logout };
