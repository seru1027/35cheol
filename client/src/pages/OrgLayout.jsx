import { useEffect, useState } from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router';
import { api } from '../api.js';
import StatusPanel from '../components/StatusPanel.jsx';

// SCR-ORG-00 동아리 레이아웃: /orgs/:orgId 아래 모든 화면을 감싸는 틀 (자기 화면 없음)
// 공통 레이아웃(AUTH-03·ORG-02) 안의 두 번째 겹. 여기서 ORG-03을 한 번 불러 내 역할을 하위 화면에 넘긴다
// 하위 화면(동아리 홈, F5~F7 공지·회원·가입 신청)은 ORG-03을 다시 부르지 않는다
export default function OrgLayout() {
  // 부모(AppLayout)가 넘긴 { orgs, reloadOrgs }. 하위 화면에 그대로 이어서 넘긴다
  const parent = useOutletContext();
  // useParams: 지금 주소에서 :orgId 자리의 값. 문자열이다 ('8', 'abc' 모두 그대로)
  const { orgId } = useParams();
  // ORG-03 결과. 어느 동아리의 결과인지(orgId)를 함께 저장한다 (아래 '늦게 온 응답' 참고)
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0); // [다시 시도]를 누를 때마다 1씩 늘려 effect를 다시 실행한다

  // ORG-03. :orgId가 바뀌면(햄버거바로 다른 동아리) 다시 부른다
  useEffect(() => {
    // 늦게 온 응답 버리기: 8 → 9로 빠르게 옮기면 8의 effect 정리 함수가 ignore를 true로 바꾼다
    // 8의 응답이 9의 응답보다 늦게 와도 화면에 쓰지 않는다 (React 문서의 race condition 처리 방식)
    let ignore = false;
    // encodeURIComponent: 주소에 '/'나 '?'가 섞여 와도 API 경로가 바뀌지 않게 한 칸의 값으로 보낸다
    api(`/api/orgs/${encodeURIComponent(orgId)}`).then(({ status, data }) => {
      if (!ignore) setResult({ orgId, status, myRole: data?.myRole ?? null });
    });
    return () => {
      ignore = true;
    };
  }, [orgId, attempt]);

  // 목록(ORG-02)과 ORG-03이 어긋날 때 목록을 다시 부른다 (F8 M2)
  // 햄버거바·메인의 목록은 AppLayout이 처음 한 번 불러 둔 것이라, 그 뒤 회장·운영진이 승인해도 '대기중'으로 남는다
  // ORG-03이 200(이제 회원)인데 목록에는 아직 PENDING이면, 들고 있는 목록이 낡은 것이므로 그때만 다시 부른다
  // 다시 불러 ACTIVE가 되면 조건이 거짓이 되어 더 부르지 않는다 (계속 도는 일 없음)
  const { orgs, reloadOrgs } = parent;
  const listedStatus = Array.isArray(orgs) ? orgs.find((org) => String(org.orgId) === orgId)?.myStatus : undefined;
  const joined = result?.orgId === orgId && result.status === 200;
  useEffect(() => {
    if (joined && listedStatus === 'PENDING') reloadOrgs();
  }, [joined, listedStatus, reloadOrgs]);

  // [다시 시도]: 결과를 비워 '불러오는 중…'을 보인 뒤 다시 요청
  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  // 로딩: 아직 결과가 없거나, 저장된 결과가 이전 동아리 것일 때
  // 9로 옮긴 직후 첫 그리기에는 result가 아직 8의 것이다. 그대로 쓰면 9 화면에 8의 역할이 잠깐 보인다
  // 그래서 orgId가 다르면 로딩으로 본다. 로딩 동안 하위 화면이 사라지므로, 홈 박스들의 state도 새로 시작한다
  if (!result || result.orgId !== orgId) return <StatusPanel kind="loading" />;

  const { status, myRole } = result;
  // 401은 api.js 공통 처리가 로그인 상태를 비우고 RequireAuth가 /login으로 보낸다. 그동안 로딩 그대로
  if (status === 401) return <StatusPanel kind="loading" />;
  // 403 MEMBERSHIP_PENDING: 주소가 /orgs/3/notices처럼 깊어도 하위 화면 대신 이 패널
  if (status === 403) return <StatusPanel kind="pending" titleAs="h1" />;
  // 404 ORG_NOT_FOUND(없는 조직·남의 조직), 400 INVALID_ORG_ID(/orgs/abc): 이유를 나누지 않는다 (존재 숨김)
  if (status === 404 || status === 400) return <StatusPanel kind="notFound" titleAs="h1" />;
  if (status !== 200) return <StatusPanel kind="error" onRetry={retry} titleAs="h1" />;

  // 동아리명은 ORG-03이 아니라 ORG-02 목록에서 찾는다 (결정 P). 응답 전(undefined)·실패(null)·목록에 없음이면 undefined
  // 주소의 orgId는 문자열, 목록의 orgId는 숫자라 문자열로 맞춰 비교한다
  const orgName = Array.isArray(parent.orgs)
    ? parent.orgs.find((org) => String(org.orgId) === orgId)?.name
    : undefined;

  // 두 겹 Outlet context: 부모 값(orgs, reloadOrgs)에 이 동아리의 값(orgId, myRole, orgName)을 더해 넘긴다
  // 하위 화면은 useOutletContext() 한 번으로 모두 받는다
  return <Outlet context={{ ...parent, orgId, myRole, orgName }} />;
}
