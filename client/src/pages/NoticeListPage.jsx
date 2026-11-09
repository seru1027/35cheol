import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { api } from '../api.js';
import BackLink from '../components/BackLink.jsx';
import PageTitle from '../components/PageTitle.jsx';
import StatusPanel from '../components/StatusPanel.jsx';
import { formatDate } from '../format.js';
import { messageOf } from '../messages.js';
import styles from './NoticeListPage.module.css';

// SCR-NOTICE-01 공지 목록 (/orgs/:orgId/notices). 동아리 레이아웃(SCR-ORG-00) 안의 하위 화면
// NOTICE-01은 전체를 준다(MVP는 페이지네이션 없음). 서버 정렬(최신순) 그대로 그린다
export default function NoticeListPage() {
  const { orgId, myRole } = useOutletContext();
  // ② [글쓰기]는 화면 표시용 판단. 실제로 막는 것은 NOTICE-03의 역할 검사(403)
  const canWrite = myRole === 'OWNER' || myRole === 'ADMIN';

  // NOTICE-01 결과: null(응답 전) 또는 { status, notices }
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // 늦게 온 응답 버리기 (OrgLayout과 같은 방식)
    api(`/api/orgs/${encodeURIComponent(orgId)}/notices`).then(({ status, data }) => {
      if (!ignore) setResult({ status, notices: data?.notices ?? null });
    });
    return () => {
      ignore = true;
    };
  }, [orgId, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  return (
    <section>
      {/* 동아리 홈으로 가는 길 (화면정의서 카드에는 없음. 상세의 '← 공지 목록'과 같은 문법으로 더함, 2026-11-09) */}
      <BackLink to={`/orgs/${orgId}`} label={messageOf('BACK_TO_ORG_HOME')} />
      {/* ① 제목 줄은 로딩·오류 중에도 남긴다 (어느 화면의 실패인지 보이게, DESIGN.md status-panel) */}
      <PageTitle
        title={messageOf('NOTICE_LIST_TITLE')}
        actions={
          canWrite && (
            // 버튼 모양이지만 이동이라 링크 (홈 박스 [글쓰기]와 같음)
            <Link to={`/orgs/${orgId}/notices/new`} className={styles.write}>{messageOf('BUTTON_WRITE')}</Link>
          )
        }
      />
      <NoticeList orgId={orgId} result={result} onRetry={retry} />
    </section>
  );
}

// 목록 자리: 로딩 / 오류 / 0건 / 표
function NoticeList({ orgId, result, onRetry }) {
  if (!result || result.status === 401) return <StatusPanel kind="loading" />; // 401은 공통 처리가 /login으로
  const { status, notices } = result;
  // 403·404·400은 보통 OrgLayout(ORG-03)이 먼저 막는다. 그 사이 상태가 바뀐 경우만 여기로 온다
  if (status === 403) return <StatusPanel kind="pending" />;
  if (status === 404 || status === 400) return <StatusPanel kind="notFound" />;
  if (status !== 200) return <StatusPanel kind="error" onRetry={onRetry} />;

  if (notices.length === 0) {
    return (
      <div className={styles.box}>
        <p className={styles.empty}>{messageOf('NOTICES_EMPTY')}</p>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      {/* 머리 줄: 눈으로 보는 칸 이름. 행 링크가 제목·작성자·작성일을 모두 읽어 주므로 화면 읽기 프로그램에는 숨긴다 */}
      <div className={`${styles.row} ${styles.head}`} aria-hidden="true">
        <span>{messageOf('COL_NOTICE_TITLE')}</span>
        <span>{messageOf('COL_NOTICE_AUTHOR')}</span>
        <span>{messageOf('COL_NOTICE_CREATED_AT')}</span>
      </div>
      <ul className={styles.list}>
        {notices.map((notice) => (
          <li key={notice.noticeId}>
            {/* ③ 행 어디를 눌러도 상세로: 행 전체가 링크 하나 */}
            <Link to={`/orgs/${orgId}/notices/${notice.noticeId}`} className={styles.row}>
              <span className={styles.title}>{notice.title}</span>
              <span className={styles.meta}>{notice.authorName}</span>
              <time className={styles.meta} dateTime={notice.createdAt}>{formatDate(notice.createdAt)}</time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
