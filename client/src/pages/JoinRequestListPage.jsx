import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router';
import { api } from '../api.js';
import BackLink from '../components/BackLink.jsx';
import PageTitle from '../components/PageTitle.jsx';
import StatusPanel from '../components/StatusPanel.jsx';
import { formatDateTime } from '../format.js';
import { messageOf } from '../messages.js';
import styles from './JoinRequestListPage.module.css';

// SCR-JOIN-02 가입 신청 목록 (/orgs/:orgId/join-requests). 회장·운영진만
// JOIN-03으로 대기 신청을 불러오고(오래된 신청 먼저, 서버 정렬 그대로), 행마다 [승인] = JOIN-04
export default function JoinRequestListPage() {
  const { orgId, myRole } = useOutletContext();

  // 일반 회원이 주소로 직접 들어오면 JOIN-03을 부르지 않고 권한 없음 패널 (화면정의서 상태표)
  // 화면 편의일 뿐이다: 실제로 막는 것은 JOIN-03·04의 역할 검사(403)
  if (myRole !== 'OWNER' && myRole !== 'ADMIN') {
    return <StatusPanel kind="forbidden" orgId={orgId} titleAs="h1" />;
  }
  return <JoinRequests orgId={orgId} />;
}

function JoinRequests({ orgId }) {
  // JOIN-03 결과: null(응답 전) 또는 { status, code, requests }. 승인한 행은 requests에서 뺀다
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  // 승인 요청 중인 신청의 membershipId들. 행마다 따로 잠근다 (다른 행은 계속 누를 수 있다, 화면정의서 ③)
  const [approvingIds, setApprovingIds] = useState(() => new Set());

  useEffect(() => {
    let ignore = false; // 늦게 온 응답 버리기 (공지·회원 목록과 같은 방식)
    api(`/api/orgs/${encodeURIComponent(orgId)}/join-requests`).then(({ status, code, data }) => {
      if (!ignore) setResult({ status, code, requests: data?.joinRequests ?? null });
    });
    return () => {
      ignore = true;
    };
  }, [orgId, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  // ---- 행이 빠진 뒤 커서 옮기기 (결정 5) ----
  // 누른 [승인]이 사라지면 커서가 body로 떨어져 키보드 사용자가 처음부터 다시 Tab해야 한다
  // 그래서 다음 행의 [승인](없으면 이전 행, 0건이면 빈 목록 문구)으로 옮긴다
  const buttonRefs = useRef(new Map()); // membershipId → [승인] 버튼
  const emptyRef = useRef(null);
  const focusAfterRemoveRef = useRef(undefined); // 옮길 곳: membershipId, 'empty', undefined(옮기지 않음)

  useEffect(() => {
    const target = focusAfterRemoveRef.current;
    if (target === undefined) return;
    focusAfterRemoveRef.current = undefined;
    if (target === 'empty') emptyRef.current?.focus();
    else buttonRefs.current.get(target)?.focus();
  }, [result]);

  // 목록에서 한 행 빼기. 커서가 그 버튼에 있었거나 떨어져 있었을 때만 옮긴다 (그사이 다른 행을 누르고 있으면 빼앗지 않음)
  function removeRow(membershipId) {
    const button = buttonRefs.current.get(membershipId);
    const focusWasHere = document.activeElement === button || document.activeElement === document.body;
    setResult((prev) => {
      const index = prev.requests.findIndex((r) => r.membershipId === membershipId);
      const rest = prev.requests.filter((r) => r.membershipId !== membershipId);
      if (focusWasHere) {
        const next = rest[index] ?? rest[index - 1];
        focusAfterRemoveRef.current = next ? next.membershipId : 'empty';
      }
      return { ...prev, requests: rest };
    });
  }

  // ③ 승인: 확인창 없이 바로 (결정 U). 응답을 받은 뒤에 행을 뺀다 (먼저 빼면 실패 때 되돌려야 함)
  async function approve(request) {
    const { membershipId, name } = request;
    setApprovingIds((prev) => new Set(prev).add(membershipId));
    const { status, code } = await api(
      `/api/orgs/${encodeURIComponent(orgId)}/join-requests/${membershipId}/approve`,
      { method: 'POST' },
    );
    setApprovingIds((prev) => {
      const next = new Set(prev);
      next.delete(membershipId);
      return next;
    });

    if (status === 200) {
      // 결정 I: 행이 사라지는 결과라 토스트로 무엇이 됐는지 남긴다
      removeRow(membershipId);
      toast.success(messageOf('JOIN_REQUEST_APPROVED').replace('{name}', name));
    } else if (status === 409 || status === 404) {
      // ④ 다른 운영진이 먼저 처리(409)·신청이 사라짐(404): 이 목록에 남을 이유가 없어 빼고 알린다
      // 실패도 성공도 아니라 아이콘 없는 토스트 (결정 4)
      removeRow(membershipId);
      toast(messageOf(code));
    } else if (status !== 401) {
      // 403(그사이 역할이 바뀜)·500·네트워크: 토스트, 행과 버튼은 그대로 (결정 K). 401은 공통 처리가 /login으로
      toast.error(messageOf(code));
      // 잠긴 동안 커서가 body로 떨어졌으면 다시 누를 수 있게 그 버튼으로 돌려준다
      // 지금은 버튼이 아직 disabled라 focus()가 듣지 않는다 → 잠금이 풀려 다시 그린 뒤(아래 effect)에 옮긴다
      if (document.activeElement === document.body) refocusRef.current = membershipId;
    }
  }

  const refocusRef = useRef(null); // 실패 뒤 커서를 돌려줄 버튼의 membershipId
  useEffect(() => {
    const id = refocusRef.current;
    if (id === null || approvingIds.has(id)) return;
    refocusRef.current = null;
    buttonRefs.current.get(id)?.focus();
  }, [approvingIds]);

  // ① 건수 = 목록 길이. 불러온 뒤에만 보인다
  const requests = result?.status === 200 ? result.requests : null;
  const count = requests ? messageOf('JOIN_REQUEST_COUNT').replace('{n}', requests.length) : null;

  return (
    <section>
      <BackLink to={`/orgs/${orgId}`} label={messageOf('BACK_TO_ORG_HOME')} />
      <PageTitle title={messageOf('JOIN_REQUEST_LIST_TITLE')} count={count} />
      <RequestList
        result={result}
        onRetry={retry}
        orgId={orgId}
        approvingIds={approvingIds}
        onApprove={approve}
        buttonRefs={buttonRefs}
        emptyRef={emptyRef}
      />
    </section>
  );
}

// 목록 자리: 로딩 / 오류 / 0건 / 표
function RequestList({ result, onRetry, orgId, approvingIds, onApprove, buttonRefs, emptyRef }) {
  if (!result || result.status === 401) return <StatusPanel kind="loading" />;
  const { status, code, requests } = result;
  // 403: 역할이 바뀐 직후 등 → 권한 없음 패널 (화면정의서 상태표). 승인 대기(PENDING)는 OrgLayout이 먼저 막는다
  if (status === 403) return <StatusPanel kind={code === 'MEMBERSHIP_PENDING' ? 'pending' : 'forbidden'} orgId={orgId} />;
  if (status === 404 || status === 400) return <StatusPanel kind="notFound" />;
  if (status !== 200) return <StatusPanel kind="error" onRetry={onRetry} />;

  // ⑥ 0건. 승인으로 마지막 행이 빠졌을 때 커서가 오는 곳이라 tabIndex={-1} (Tab 순서에는 넣지 않고 focus()만 받는다)
  if (requests.length === 0) {
    return (
      <div className={styles.box}>
        <div className={styles.empty} ref={emptyRef} tabIndex={-1}>
          <p className={styles.emptyTitle}>{messageOf('JOIN_REQUESTS_PAGE_EMPTY')}</p>
          <p className={styles.emptyDesc}>{messageOf('JOIN_REQUESTS_PAGE_EMPTY_DESC')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      {/* 머리 줄: 행이 글자 + 버튼이라 칸 이름도 읽힌다. 마지막(행동) 칸은 이름 없음 (와이어프레임) */}
      <div className={`${styles.row} ${styles.head}`}>
        <span>{messageOf('COL_MEMBER_NAME')}</span>
        <span>{messageOf('COL_MEMBER_LOGIN_ID')}</span>
        <span>{messageOf('COL_JOIN_REQUESTED_AT')}</span>
        <span />
      </div>
      <ul className={styles.list}>
        {requests.map((request) => {
          const approving = approvingIds.has(request.membershipId);
          const label = messageOf(approving ? 'BUTTON_APPROVING' : 'BUTTON_APPROVE');
          return (
            <li key={request.membershipId} className={`${styles.row} ${styles.requestRow}`}>
              <span className={styles.name}>{request.name}</span>
              <span className={styles.meta}>{request.loginId}</span>
              <time className={styles.meta} dateTime={request.requestedAt}>{formatDateTime(request.requestedAt)}</time>
              <span className={styles.action}>
                {/* ref 콜백: 그려질 때 Map에 넣고, 사라질 때(null) 뺀다 */}
                {/* aria-label: '승인'만으로는 누구의 승인인지 몰라 이름을 붙인다 (보이는 글자 '승인'을 포함) */}
                <button
                  type="button"
                  ref={(node) => {
                    if (node) buttonRefs.current.set(request.membershipId, node);
                    else buttonRefs.current.delete(request.membershipId);
                  }}
                  className={styles.approve}
                  onClick={() => onApprove(request)}
                  disabled={approving}
                  aria-label={`${request.name} ${label}`}
                >
                  {label}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
