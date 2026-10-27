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

module.exports = { createOrg };
