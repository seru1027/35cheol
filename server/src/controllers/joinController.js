const crypto = require('crypto');
const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');
const { validateString } = require('../utils/validate');

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

// JOIN-02 가입 신청. 신청자는 조직 ID를 모르고 코드만 알아서, 멤버십 미들웨어 없이 코드로 조직을 찾는다
async function createJoinRequest(req, res) {
  // 필수값·문자열 타입만 검사하고 형식은 보지 않는다. 형식이 틀린 코드는 어차피 조회에 실패해 404
  const inviteCode = validateString(req.body.inviteCode, { field: 'INVITE_CODE', uppercase: true });
  if (inviteCode.code) return sendResponse(res, 400, inviteCode.code);

  // 재발급으로 무효가 된 코드도 DB에 없으므로 여기서 404
  const [orgRows] = await pool.query(
    'SELECT id, name FROM organizations WHERE invite_code = ?',
    [inviteCode.value],
  );
  const org = orgRows[0];
  if (!org) {
    return sendResponse(res, 404, 'INVITE_CODE_NOT_FOUND');
  }

  // 새 행이든 재사용이든 '신청이 새로 생김'이라 같은 201, 응답은 ORG-02 목록 항목과 같은 모양
  const created = () => sendResponse(res, 201, 'JOIN_REQUEST_SUCCESS', {
    orgId: org.id,
    name: org.name,
    myRole: null,
    myStatus: 'PENDING',
  });

  // (1) INSERT를 먼저 시도한다. role·joined_at은 NULL, requested_at은 기본값(지금, UTC) (D2·D5·D6)
  try {
    await pool.query(
      "INSERT INTO memberships (user_id, org_id, status) VALUES (?, ?, 'PENDING')",
      [req.userId, org.id],
    );
    return created();
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err;
  }

  // (2) 1062: 이 사람·이 조직의 행이 이미 있다 (UNIQUE (user_id, org_id)).
  // 신청할 수 있는 상태(PENDING·ACTIVE가 아님)일 때만 그 행을 PENDING으로 재사용한다.
  // 상태 조건을 UPDATE에 같이 걸어서, 버튼을 두 번 눌러도 첫 요청만 바뀐다
  const [updateResult] = await pool.query(
    `UPDATE memberships
     SET role = NULL, status = 'PENDING', requested_at = CURRENT_TIMESTAMP, joined_at = NULL
     WHERE user_id = ? AND org_id = ? AND status NOT IN ('PENDING', 'ACTIVE')`,
    [req.userId, org.id],
  );
  if (updateResult.affectedRows === 1) {
    return created();
  }

  // (3) 바뀐 행이 0개: 이미 대기 중이거나 회원이다. 지금 상태를 보고 409를 고른다
  const [rows] = await pool.query(
    'SELECT status FROM memberships WHERE user_id = ? AND org_id = ?',
    [req.userId, org.id],
  );
  const status = rows[0]?.status;
  if (status === 'PENDING') return sendResponse(res, 409, 'JOIN_ALREADY_REQUESTED');
  if (status === 'ACTIVE') return sendResponse(res, 409, 'ALREADY_ORG_MEMBER');

  // MVP에는 거절 기능이 없어 일어나지 않는 경우. 생기면 버그라 숨기지 않고 500
  throw new Error(`가입 신청: 예상하지 못한 멤버십 상태 ${status}`);
}

// JOIN-03 가입 신청 목록: 이 조직의 대기 중(PENDING) 신청. 허용 역할: OWNER, ADMIN
async function getJoinRequests(req, res) {
  // 데이터 격리: 조직 ID 조건을 반드시 건다 → 다른 조직의 신청은 섞이지 않는다
  // 신청자 아이디·이름은 users에서 JOIN으로. 정렬은 오래된 신청 먼저, 같은 초면 id (API 명세서 v0.4)
  const [rows] = await pool.query(
    `SELECT m.id, u.login_id, u.name, m.requested_at
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.org_id = ? AND m.status = 'PENDING'
     ORDER BY m.requested_at, m.id`,
    [req.orgId],
  );

  // membershipId는 JOIN-04 승인 URL에 쓴다. requestedAt은 Date → JSON에서 ISO 8601 UTC 문자열
  const joinRequests = rows.map((row) => ({
    membershipId: row.id,
    loginId: row.login_id,
    name: row.name,
    requestedAt: row.requested_at,
  }));

  return sendResponse(res, 200, 'GET_JOIN_REQUESTS_SUCCESS', { joinRequests });
}

// JOIN-04 가입 승인: 대기 중인 신청 하나를 회원(ACTIVE, MEMBER)으로. 허용 역할: OWNER, ADMIN
// URL의 membershipId는 checkIds가 형식을 검사해 req.membershipId에 붙여 둔다
async function approveJoinRequest(req, res) {
  // 한 문장으로 데이터 격리와 동시 승인을 함께 처리한다
  //   org_id = ?            → 다른 조직의 신청 번호를 넣어도 바뀌지 않음 (IDOR 방어)
  //   status = 'PENDING'    → 두 운영진이 동시에 승인해도 먼저 온 요청만 바뀜
  // ACTIVE면 역할·가입 시각이 반드시 있어야 한다 (D8 CHECK)
  const [result] = await pool.query(
    `UPDATE memberships
     SET status = 'ACTIVE', role = 'MEMBER', joined_at = CURRENT_TIMESTAMP
     WHERE id = ? AND org_id = ? AND status = 'PENDING'`,
    [req.membershipId, req.orgId],
  );
  if (result.affectedRows === 1) {
    return sendResponse(res, 200, 'APPROVE_JOIN_REQUEST_SUCCESS');
  }

  // 바뀐 행이 0개: 이 조직에 그 신청이 아예 없는지, 있는데 이미 처리됐는지 가른다
  const [rows] = await pool.query(
    'SELECT id FROM memberships WHERE id = ? AND org_id = ?',
    [req.membershipId, req.orgId],
  );
  if (rows.length === 0) {
    // 없는 ID, 또는 다른 조직의 ID: 같은 404로 다른 조직의 신청이 있는지 알려주지 않는다
    return sendResponse(res, 404, 'JOIN_REQUEST_NOT_FOUND');
  }
  return sendResponse(res, 409, 'JOIN_REQUEST_ALREADY_PROCESSED');
}

module.exports = {
  createInviteCode, getInviteCode, createJoinRequest, getJoinRequests, approveJoinRequest,
};
