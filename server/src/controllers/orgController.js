const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');
const { validateString } = require('../utils/validate');

// ORG-01 조직 생성: 조직과 만든 사람의 멤버십(OWNER, ACTIVE)을 한 트랜잭션으로 만든다
async function createOrg(req, res) {
  // body 필드는 name이지만 사용자 이름과 뜻이 달라 코드에 ORG_를 붙인다 (API 명세서 0-3)
  const name = validateString(req.body.name, { field: 'ORG_NAME', min: 1, max: 30 });
  if (name.code) return sendResponse(res, 400, name.code);

  // 트랜잭션은 커넥션 단위다. 커넥션 하나를 빌려 BEGIN~COMMIT을 모두 같은 커넥션에서 실행한다
  // (pool.query는 쿼리마다 다른 커넥션을 쓸 수 있어 두 INSERT가 한 트랜잭션에 묶이지 않는다)
  const conn = await pool.getConnection();
  let orgId;
  try {
    await conn.beginTransaction();

    const [orgResult] = await conn.query(
      'INSERT INTO organizations (name) VALUES (?)',
      [name.value],
    );
    orgId = orgResult.insertId;

    // ACTIVE면 역할·가입 시각이 반드시 있어야 한다 (D8 CHECK). requested_at은 기본값, 둘 다 UTC (D6)
    await conn.query(
      `INSERT INTO memberships (user_id, org_id, role, status, joined_at)
       VALUES (?, ?, 'OWNER', 'ACTIVE', CURRENT_TIMESTAMP)`,
      [req.userId, orgId],
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback(); // 하나라도 실패하면 둘 다 취소해 아무것도 남기지 않는다
    throw err; // 에러 처리 함수가 500으로 바꾼다
  } finally {
    conn.release(); // 성공·실패와 관계없이 빌린 커넥션을 풀에 돌려준다
  }

  return sendResponse(res, 201, 'CREATE_ORG_SUCCESS', { orgId });
}

// ORG-02 내 조직 목록: 내 멤버십이 ACTIVE·PENDING인 조직. 사용자는 토큰에서만 꺼낸다 (req.userId)
async function getMyOrgs(req, res) {
  // memberships에서 내 행을 찾고, 같은 org_id의 organizations 행을 붙여 이름을 읽는다
  // 정렬: 먼저 들어간 동아리가 앞. requested_at은 초 단위라 같은 초면 id(들어간 순서)로 고정한다
  const [rows] = await pool.query(
    `SELECT o.id, o.name, m.role, m.status
     FROM memberships m
     JOIN organizations o ON o.id = m.org_id
     WHERE m.user_id = ? AND m.status IN ('ACTIVE', 'PENDING')
     ORDER BY m.requested_at, m.id`,
    [req.userId],
  );

  // 0개면 빈 배열 (404 아님). PENDING이면 role이 NULL이라 myRole도 null (D2)
  const orgs = rows.map((row) => ({
    orgId: row.id,
    name: row.name,
    myRole: row.role,
    myStatus: row.status,
  }));

  return sendResponse(res, 200, 'GET_MY_ORGS_SUCCESS', { orgs });
}

// ORG-03 조직 조회 (동아리 홈 진입 확인). checkIds·requireMembership을 통과해야 여기 온다
// 응답은 이미 가진 값(숫자로 바꾼 URL의 조직 ID, 미들웨어가 읽은 내 역할)만으로 만들어 추가 SQL이 없다.
// 동아리 이름은 담지 않는다 (화면은 ORG-02 목록에서 찾음)
function getOrg(req, res) {
  return sendResponse(res, 200, 'GET_ORG_SUCCESS', {
    orgId: req.orgId,
    myRole: req.membership.role,
  });
}

module.exports = { createOrg, getMyOrgs, getOrg };
