import { Link, useOutletContext } from 'react-router';
import { api } from '../api.js';
import { formatDate } from '../format.js';
import { messageOf } from '../messages.js';
import { HomeBox, MoreLink, useBoxData } from './HomeBox.jsx';
import styles from './OrgHomePage.module.css';

const PREVIEW_COUNT = 5; // 홈 박스에 보이는 개수 (결정 M)

// SCR-ORG-03 ② 공지 박스 (NOTICE-01) + ③ [글쓰기]
// NOTICE-01은 전체를 주고(MVP는 페이지네이션 없음), 홈은 앞의 5개만 그린다 (명세 NOTICE-01). 서버 정렬(최신순) 그대로
export default function NoticeBox() {
  const { orgId, myRole } = useOutletContext();
  const canWrite = myRole === 'OWNER' || myRole === 'ADMIN';
  const { status, data: notices, retry } = useBoxData(async () => {
    const result = await api(`/api/orgs/${orgId}/notices`);
    return result.status === 200 ? result.data.notices.slice(0, PREVIEW_COUNT) : null;
  });

  return (
    <HomeBox
      title={messageOf('BOX_NOTICES')}
      status={status}
      onRetry={retry}
      actions={
        <>
          {/* ③ 회장·운영진만. 박스 안에서 쓰지 않고 작성 화면으로 이동 (결정 L). 버튼 모양이지만 이동이라 링크 */}
          {canWrite && (
            <Link to={`/orgs/${orgId}/notices/new`} className={styles.utility}>{messageOf('BUTTON_WRITE')}</Link>
          )}
          <MoreLink to={`/orgs/${orgId}/notices`} label={messageOf('LINK_ALL_NOTICES')} />
        </>
      }
    >
      {notices?.length === 0 ? (
        <p className={styles.note}>{messageOf('NOTICES_EMPTY')}</p>
      ) : (
        <ul className={styles.list}>
          {notices?.map((notice) => (
            <li key={notice.noticeId}>
              <Link to={`/orgs/${orgId}/notices/${notice.noticeId}`} className={styles.noticeRow}>
                <span className={styles.noticeTitle}>{notice.title}</span>
                {/* time: 기계가 읽는 원래 시각(dateTime)과 사람이 읽는 표시를 함께 둔다 */}
                <span className={styles.meta}>
                  {notice.authorName} · <time dateTime={notice.createdAt}>{formatDate(notice.createdAt)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HomeBox>
  );
}
