const pool = require('../db/connection');
const { sendResponse } = require('../utils/response');

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

module.exports = { getNotices, getNotice };
