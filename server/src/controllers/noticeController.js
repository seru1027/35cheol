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

module.exports = { getNotices };
