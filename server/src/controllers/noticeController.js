const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');
const { validateString } = require('../utils/validate');

// 모든 공지 SQL에 org_id 조건을 건다: URL의 조직 것만 보고·고치고·지운다 (데이터 격리, IDOR 방어)
// 작성자 이름은 users와 JOIN한 현재 이름 (D9)

// NOTICE-01 공지 목록. 허용 역할: 모두. 본문은 담지 않는다 (상세에서)
// 다른 조직 회원은 그 전에 멤버십 미들웨어에서 404로 막힌다 (MVP 완료 기준)
async function getNotices(req, res) {
  // 최신순, 같은 초에 쓴 공지도 순서가 고정되게 id DESC (인덱스 idx_notices_org_created)
  const [rows] = await pool.query(
    `SELECT n.id, n.title, u.name AS author_name, n.created_at
     FROM notices n
     JOIN users u ON u.id = n.author_id
     WHERE n.org_id = ?
     ORDER BY n.created_at DESC, n.id DESC`,
    [req.orgId],
  );

  const notices = rows.map((row) => ({
    noticeId: row.id,
    title: row.title,
    authorName: row.author_name,
    createdAt: row.created_at,
  }));

  return sendResponse(res, 200, 'GET_NOTICES_SUCCESS', { notices });
}

// 공지 하나를 상세 모양으로 읽는다. 없거나 다른 조직의 공지면 null (NOTICE-02 상세, NOTICE-04 수정 응답)
async function findNotice(noticeId, orgId) {
  const [rows] = await pool.query(
    `SELECT n.id, n.title, n.content, u.name AS author_name, n.created_at, n.updated_at
     FROM notices n
     JOIN users u ON u.id = n.author_id
     WHERE n.id = ? AND n.org_id = ?`,
    [noticeId, orgId],
  );
  const row = rows[0];
  if (!row) return null;

  return {
    noticeId: row.id,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at, // 수정된 적 없으면 null
  };
}

// NOTICE-02 공지 상세. 허용 역할: 모두
// 공지 ID는 checkIds가 형식을 검사해 req.noticeId에 붙여 둔다
async function getNotice(req, res) {
  // AND org_id = ?: /orgs/A/notices/(B 공지 ID)는 여기서 404로 막힌다 (MVP 완료 기준)
  const notice = await findNotice(req.noticeId, req.orgId);
  if (!notice) {
    return sendResponse(res, 404, 'NOTICE_NOT_FOUND');
  }
  return sendResponse(res, 200, 'GET_NOTICE_SUCCESS', notice);
}

// 제목·본문 검사 (NOTICE-03 작성과 NOTICE-04 수정이 같은 규칙)
// 앞뒤 공백만 지우고 나머지(줄바꿈, <script> 같은 글자)는 입력 그대로. 안전한 출력은 화면의 일 (NOTICE-02)
// 검사 순서는 body 순서: title → content. 처음 걸린 코드 하나, 통과하면 code가 null
function validateNoticeBody(body) {
  const title = validateString(body.title, { field: 'TITLE', min: 1, max: 100 });
  if (title.code) return { code: title.code };

  const content = validateString(body.content, { field: 'CONTENT', min: 1, max: 5000 });
  if (content.code) return { code: content.code };

  return { code: null, title: title.value, content: content.value };
}

// NOTICE-03 공지 작성. 허용 역할: OWNER, ADMIN. 검사 순서: 로그인 → ID 형식 → 멤버십 → 역할 → 입력값
async function createNotice(req, res) {
  const input = validateNoticeBody(req.body);
  if (input.code) return sendResponse(res, 400, input.code);

  // 조직은 URL의 조직 ID, 작성자는 토큰의 사용자 ID로 서버가 넣는다.
  // body에 orgId·authorId가 와도 쓰지 않는다 (Mass Assignment 방어)
  const [result] = await pool.query(
    'INSERT INTO notices (org_id, author_id, title, content) VALUES (?, ?, ?, ?)',
    [req.orgId, req.userId, input.title, input.content],
  );

  return sendResponse(res, 201, 'CREATE_NOTICE_SUCCESS', { noticeId: result.insertId });
}

// NOTICE-04 공지 수정 (제목·본문 통째로 교체 → PUT). 허용 역할: OWNER, ADMIN (작성자 본인 제한 없음)
// 검사 순서: 로그인 → ID 형식 → 멤버십 → 역할 → 입력값 → 데이터 격리
async function updateNotice(req, res) {
  const input = validateNoticeBody(req.body);
  if (input.code) return sendResponse(res, 400, input.code);

  // AND org_id = ?: A 회원이 B 공지 ID로 수정하면 바뀐 행이 0 → 404 (MVP 완료 기준)
  // 조직·작성자·작성 시각은 바꾸지 않는다. 동시 수정은 나중에 저장한 쪽이 덮어쓴다
  const [result] = await pool.query(
    `UPDATE notices
     SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND org_id = ?`,
    [input.title, input.content, req.noticeId, req.orgId],
  );
  if (result.affectedRows === 0) {
    return sendResponse(res, 404, 'NOTICE_NOT_FOUND');
  }

  // 상세와 같은 모양으로 돌려줘 화면이 다시 조회하지 않게 한다
  const notice = await findNotice(req.noticeId, req.orgId);
  if (!notice) {
    // UPDATE와 이 조회 사이에 다른 운영진이 지운 경우
    return sendResponse(res, 404, 'NOTICE_NOT_FOUND');
  }
  return sendResponse(res, 200, 'UPDATE_NOTICE_SUCCESS', notice);
}

// NOTICE-05 공지 삭제 (행을 DB에서 지움). 허용 역할: OWNER, ADMIN (작성자 본인 제한 없음)
async function deleteNotice(req, res) {
  // AND org_id = ?: A 회원이 B 공지 ID로 삭제하면 지운 행이 0 → 404 (MVP 완료 기준)
  // 없는 공지, 다른 운영진이 먼저 지운 공지도 같은 404
  const [result] = await pool.query(
    'DELETE FROM notices WHERE id = ? AND org_id = ?',
    [req.noticeId, req.orgId],
  );
  if (result.affectedRows === 0) {
    return sendResponse(res, 404, 'NOTICE_NOT_FOUND');
  }
  return sendResponse(res, 200, 'DELETE_NOTICE_SUCCESS');
}

module.exports = {
  getNotices, getNotice, createNotice, updateNotice, deleteNotice,
};
