const bcrypt = require('bcrypt');
const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');
const { validateString } = require('../utils/validate');

// bcrypt 해시 강도 (1 올릴 때마다 시간 2배). AUTH-02의 가짜 해시도 이 값으로 만든다 (API 명세서 AUTH-02)
const BCRYPT_COST = 10;

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

module.exports = { signup };
