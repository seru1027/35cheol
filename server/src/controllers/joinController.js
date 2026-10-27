const crypto = require('crypto');
const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');

// 초대 코드: 8자리, 영문 대문자+숫자 36자에서 헷갈리는 0 O 1 I L을 뺀 31자 (API 명세서 JOIN-01)
const INVITE_CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const INVITE_CODE_LENGTH = 8;

// 다른 조직의 코드와 겹치면(1062) 다시 뽑는 최대 횟수. 다 겹치면 500 (31^8 ≈ 8,500억이라 거의 없음)
const MAX_INVITE_CODE_TRIES = 5;

// 맞히기 어려워야 하는 값이라 Math.random(예측 가능) 대신 crypto로 뽑는다
function generateInviteCode() {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CODE_CHARS[crypto.randomInt(INVITE_CODE_CHARS.length)];
  }
  return code;
}

// JOIN-01 초대 코드 발급 (재발급 포함). 허용 역할: OWNER, ADMIN
// 덮어써서 이전 코드는 즉시 무효. 이미 들어온 신청은 코드와 연결되어 있지 않아 그대로 남는다
async function createInviteCode(req, res) {
  for (let attempt = 1; attempt <= MAX_INVITE_CODE_TRIES; attempt += 1) {
    const inviteCode = generateInviteCode();
    try {
      await pool.query(
        'UPDATE organizations SET invite_code = ? WHERE id = ?',
        [inviteCode, req.orgId],
      );
      return sendResponse(res, 201, 'CREATE_INVITE_CODE_SUCCESS', { inviteCode });
    } catch (err) {
      // 서버가 뽑은 값이 겹친 것이라 409가 아니라 다시 뽑는다 (ERD 0-3)
      if (err.code !== 'ER_DUP_ENTRY') throw err;
    }
  }
  throw new Error(`초대 코드가 ${MAX_INVITE_CODE_TRIES}번 연속 겹침`);
}

// JOIN-01 초대 코드 조회. 허용 역할: OWNER, ADMIN (발급과 같음)
// 아직 발급하지 않았으면 inviteCode가 null (404 아님)
async function getInviteCode(req, res) {
  // 멤버십 미들웨어를 통과했으니 조직은 반드시 있다 (memberships.org_id 외래 키)
  const [rows] = await pool.query(
    'SELECT invite_code FROM organizations WHERE id = ?',
    [req.orgId],
  );
  return sendResponse(res, 200, 'GET_INVITE_CODE_SUCCESS', { inviteCode: rows[0].invite_code });
}

module.exports = { createInviteCode, getInviteCode };
