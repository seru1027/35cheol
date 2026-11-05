import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router';
import StatusPanel from '../components/StatusPanel.jsx';
import { messageOf } from '../messages.js';
import CreateOrgModal from './CreateOrgModal.jsx';
import styles from './MainPage.module.css';

// SCR-ORG-01 메인 (내 동아리 목록). 공통 레이아웃의 본문 자리 (/)
// 목록은 직접 부르지 않고 공통 레이아웃이 부른 ORG-02를 같이 쓴다 (화면정의서 '데이터 출처', 햄버거바와 같은 목록)
// 카드 모양은 네이버 밴드 비율 (DESIGN.md org-card): 위 색 띠 + 아래 이름·역할
// 만들기 카드 → SCR-ORG-02 모달. F3-3: 가입하기 카드 → SCR-JOIN-01 모달. F4: /orgs/:orgId 동아리 홈 (지금은 404 패널)
export default function MainPage() {
  // useOutletContext: 부모 라우트(AppLayout)의 <Outlet context={...}>로 넘긴 값을 꺼낸다
  // orgs: undefined 응답 전, null 실패, 배열 내 동아리 (레이아웃이 대기중을 맨 뒤로 정렬해 넘김)
  const { orgs, reloadOrgs } = useOutletContext();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  // SCR-ORG-02 ③ 201 → 모달 닫기 → 목록 다시 불러오기 → 새 동아리 홈
  function handleCreated(orgId) {
    setCreateOpen(false);
    reloadOrgs(); // 기존 목록을 둔 채 조용히 바꾼다. 햄버거바에 새 동아리가 생긴다
    navigate(`/orgs/${orgId}`); // 보통 이동(push): 메인은 정상 화면이라 뒤로 가기로 돌아와도 된다 (replace 안 씀)
  }

  return (
    <section>
      {/* 화면정의서: 메인은 본문 제목 줄 없음. 화면 읽기 프로그램이 페이지 이름을 알 수 있게 h1만 숨겨 둔다 */}
      <h1 className="visually-hidden">{messageOf('MAIN_TITLE')}</h1>

      {/* ⑤ 만들기·가입하기가 항상 앞 → 가입한 동아리(ORG-02 순서) → 대기중 동아리(ORG-02 순서). 한 줄 개수는 폭에 따라 */}
      <ul className={styles.grid}>
        {/* ①② 데이터와 관계없어서 로딩·실패 중에도 바로 보인다 */}
        <li>
          <ActionCard
            icon={<PlusIcon />}
            title="CARD_CREATE_ORG"
            desc="CARD_CREATE_ORG_DESC"
            onClick={() => setCreateOpen(true)}
          />
        </li>
        <li>
          {/* F3-3에서 onClick으로 SCR-JOIN-01 모달을 연다 */}
          <ActionCard icon={<JoinIcon />} title="CARD_JOIN_ORG" desc="CARD_JOIN_ORG_DESC" />
        </li>
        {orgs?.map((org) => (
          <li key={org.orgId}>
            <OrgCard org={org} />
          </li>
        ))}
      </ul>

      {/* 동아리 카드 자리의 상태. 0개(빈 배열)면 아무것도 그리지 않는다: 만들기·가입하기 두 장만 (화면정의서) */}
      {orgs === undefined && <StatusPanel kind="loading" />}
      {/* [다시 시도]: 레이아웃이 목록을 비워 로딩을 보여 준 뒤 다시 부른다 → 햄버거바도 함께 갱신 */}
      {orgs === null && <StatusPanel kind="error" onRetry={() => reloadOrgs({ showLoading: true })} />}

      {/* 조건부로 그린다: 닫으면 모달이 통째로 사라져 입력값도 버려진다 */}
      {createOpen && <CreateOrgModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}
    </section>
  );
}

// ①② 만들기·가입하기: 동아리 카드와 같은 흰 카드, 가운데에 원 아이콘 + 제목 + 설명 (밴드처럼)
// aria-haspopup="dialog": 누르면 대화상자가 열린다는 것을 화면 읽기 프로그램에 미리 알린다
function ActionCard({ icon, title, desc, onClick }) {
  return (
    <button type="button" className={styles.actionCard} onClick={onClick} aria-haspopup="dialog">
      <span className={styles.actionIcon} aria-hidden="true">{icon}</span>
      <span className={styles.name}>{messageOf(title)}</span>
      <span className={styles.meta}>{messageOf(desc)}</span>
    </button>
  );
}

// ③ ACTIVE: 색 띠 + 이름 + 내 역할 / ④ PENDING: 회색 띠 + '대기중', 역할 없음 (myRole이 null). 둘 다 /orgs/:orgId로 간다
function OrgCard({ org }) {
  const pending = org.myStatus === 'PENDING';
  // 색은 orgId로 고른다: 목록 순서가 바뀌거나 이름이 바뀌어도 같은 동아리는 늘 같은 색 (sticker 6색)
  const bandClass = pending ? styles.bandPending : styles[`band${org.orgId % 6}`];
  // 첫 글자: [...문자열]은 코드 포인트 단위로 나눈다 (이모지로 시작하는 이름도 반쪽으로 잘리지 않게)
  const initial = [...org.name][0];

  return (
    <Link to={`/orgs/${org.orgId}`} className={pending ? `${styles.orgCard} ${styles.pending}` : styles.orgCard}>
      {/* 사진 자리의 장식. 이름이 아래에 다시 나오므로 화면 읽기 프로그램에는 숨긴다 */}
      <span className={`${styles.band} ${bandClass}`} aria-hidden="true">{initial}</span>
      <span className={styles.body}>
        {/* 2줄이 넘으면 화면에서만 … 로 잘린다. 링크 이름(화면 읽기 프로그램)은 전체 이름 */}
        <span className={styles.name}>{org.name}</span>
        <span className={styles.meta}>{messageOf(pending ? 'STATUS_PENDING' : `ROLE_${org.myRole}`)}</span>
      </span>
    </Link>
  );
}

// + 아이콘. 굵기 1.5는 다른 선 아이콘(☰·로그아웃)과 맞춤
function PlusIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" focusable="false">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 들어가는 화살표: 오른쪽 문으로 들어감 (로그아웃 아이콘의 반대 방향)
function JoinIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" focusable="false">
      <path
        d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M4.5 12h10M11 8.5l3.5 3.5-3.5 3.5"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
