import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { api } from '../api.js';
import BackLink from '../components/BackLink.jsx';
import PageTitle from '../components/PageTitle.jsx';
import StatusPanel from '../components/StatusPanel.jsx';
import { formatDate } from '../format.js';
import { messageOf } from '../messages.js';
import styles from './MemberListPage.module.css';

// 이 화면이 그릴 수 있는 칸 전부 (순서 = 화면 순서, 화면정의서 ②·③)
// 어느 칸을 그릴지는 myRole이 아니라 **응답에 그 항목이 있는지**로 정한다 (결정 1, 2026-11-10)
//   서버가 역할별로 항목을 골라 보낸다(명세 MEMBER-01). 화면이 다시 역할로 판단하면 규칙이 두 곳이 된다
//   membershipId는 칸이 아니라 여기 없다 (핵심 기능의 역할 변경·추방에 쓰는 값)
// width: 칸 폭 (index.css 값). 첫 칸만 남는 폭
const COLUMNS = [
  { key: 'name', label: 'COL_MEMBER_NAME', width: 'minmax(0, 1fr)' },
  { key: 'loginId', label: 'COL_MEMBER_LOGIN_ID', width: 'var(--member-col-login-id)' },
  { key: 'joinedAt', label: 'COL_MEMBER_JOINED_AT', width: 'var(--member-col-date)' },
  { key: 'role', label: 'COL_MEMBER_ROLE', width: 'var(--member-col-role)' },
];

// 칸 하나의 글자. 날짜·역할은 응답 값을 화면 글자로 바꾼다
function cellText(key, value) {
  if (key === 'joinedAt') return <time dateTime={value}>{formatDate(value)}</time>;
  if (key === 'role') return messageOf(`ROLE_${value}`);
  return value;
}

// SCR-MEMBER-01 회원 목록 (/orgs/:orgId/members). 동아리 레이아웃(SCR-ORG-00) 안의 하위 화면, 모든 역할
// 서버 정렬(역할 순 → 가입 순) 그대로 그린다. 행은 누를 수 없다 (MVP)
export default function MemberListPage() {
  const { orgId } = useOutletContext();

  // MEMBER-01 결과: null(응답 전) 또는 { status, members }
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // 늦게 온 응답 버리기 (공지 목록과 같은 방식)
    api(`/api/orgs/${encodeURIComponent(orgId)}/members`).then(({ status, data }) => {
      if (!ignore) setResult({ status, members: data?.members ?? null });
    });
    return () => {
      ignore = true;
    };
  }, [orgId, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  // ① 인원 수 = 목록 길이. 불러온 뒤에만 보인다
  const members = result?.status === 200 ? result.members : null;
  const count = members ? messageOf('MEMBER_COUNT').replace('{n}', members.length) : null;

  return (
    <section>
      <BackLink to={`/orgs/${orgId}`} label={messageOf('BACK_TO_ORG_HOME')} />
      {/* 제목 줄은 로딩·오류 중에도 남긴다. 오른쪽 행동 버튼 없음 (MVP) */}
      <PageTitle title={messageOf('MEMBER_LIST_TITLE')} count={count} />
      <MemberList result={result} onRetry={retry} />
    </section>
  );
}

// 목록 자리: 로딩 / 오류 / 표. 빈 목록은 없다 (최소 1명: 나)
function MemberList({ result, onRetry }) {
  if (!result || result.status === 401) return <StatusPanel kind="loading" />; // 401은 공통 처리가 /login으로
  const { status, members } = result;
  // 403(승인 대기)·404·400은 보통 OrgLayout(ORG-03)이 먼저 막는다. 그 사이 상태가 바뀐 경우만 여기로 온다
  if (status === 403) return <StatusPanel kind="pending" />;
  if (status === 404 || status === 400) return <StatusPanel kind="notFound" />;
  if (status !== 200) return <StatusPanel kind="error" onRetry={onRetry} />;

  // 칸 = 첫 행에 있는 항목 (모든 행이 같은 모양). 칸 나눔도 보이는 칸으로 만든다 (회장·운영진 4칸, 회원 2칸)
  const columns = COLUMNS.filter((column) => column.key in members[0]);
  const gridStyle = { gridTemplateColumns: columns.map((column) => column.width).join(' ') };

  return (
    <div className={styles.box}>
      {/* 머리 줄: 행이 누를 수 없는 글자라 칸 이름도 화면 읽기 프로그램에 그대로 읽힌다 (공지 목록과 달리 aria-hidden 없음) */}
      <div className={`${styles.row} ${styles.head}`} style={gridStyle}>
        {columns.map((column) => (
          <span key={column.key}>{messageOf(column.label)}</span>
        ))}
      </div>
      <ul className={styles.list}>
        {/* key: 일반 회원 응답에는 membershipId가 없어 순서를 쓴다 (목록이 바뀌지 않는 화면이라 순서로 충분) */}
        {members.map((member, index) => (
          <li key={member.membershipId ?? index} className={styles.row} style={gridStyle}>
            {columns.map((column, i) => (
              <span key={column.key} className={i === 0 ? styles.name : styles.meta}>
                {cellText(column.key, member[column.key])}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
