import { Link, useOutletContext } from 'react-router';
import StatusPanel from '../components/StatusPanel.jsx';
import { messageOf } from '../messages.js';
import styles from './MainPage.module.css';

// SCR-ORG-01 메인 (내 동아리 목록). 공통 레이아웃의 본문 자리 (/)
// 목록은 직접 부르지 않고 공통 레이아웃이 부른 ORG-02를 같이 쓴다 (화면정의서 '데이터 출처', 햄버거바와 같은 목록)
// F3-2·F3-3: 만들기·가입하기 카드가 모달을 연다. F4: 카드를 누르면 가는 /orgs/:orgId (지금은 404 패널)
export default function MainPage() {
  // useOutletContext: 부모 라우트(AppLayout)의 <Outlet context={...}>로 넘긴 값을 꺼낸다
  const { orgs, reloadOrgs } = useOutletContext(); // orgs: undefined 응답 전, null 실패, 배열 내 동아리

  return (
    <section>
      {/* 화면정의서: 메인은 본문 제목 줄 없음. 화면 읽기 프로그램이 페이지 이름을 알 수 있게 h1만 숨겨 둔다 */}
      <h1 className="visually-hidden">{messageOf('MAIN_TITLE')}</h1>

      {/* ⑤ 만들기·가입하기가 항상 앞, 그 뒤는 ORG-02 순서 그대로. 한 줄에 4개 */}
      <ul className={styles.grid}>
        {/* ①② 데이터와 관계없어서 로딩·실패 중에도 바로 보인다 */}
        <li>
          {/* F3-2에서 onClick으로 SCR-ORG-02 모달을 연다 */}
          <button type="button" className={styles.actionCard}>
            <span className={styles.name}>{messageOf('CARD_CREATE_ORG')}</span>
            <span className={styles.meta}>{messageOf('CARD_CREATE_ORG_DESC')}</span>
          </button>
        </li>
        <li>
          {/* F3-3에서 onClick으로 SCR-JOIN-01 모달을 연다 */}
          <button type="button" className={styles.actionCard}>
            <span className={styles.name}>{messageOf('CARD_JOIN_ORG')}</span>
            <span className={styles.meta}>{messageOf('CARD_JOIN_ORG_DESC')}</span>
          </button>
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
    </section>
  );
}

// ③ ACTIVE: 이름 + 내 역할 / ④ PENDING: 회색 + '대기중', 역할 없음 (myRole이 null). 둘 다 /orgs/:orgId로 간다
function OrgCard({ org }) {
  const pending = org.myStatus === 'PENDING';
  return (
    <Link to={`/orgs/${org.orgId}`} className={pending ? `${styles.orgCard} ${styles.pending}` : styles.orgCard}>
      {/* 2줄이 넘으면 화면에서만 … 로 잘린다. 링크 이름(화면 읽기 프로그램)은 전체 이름 */}
      <span className={styles.name}>{org.name}</span>
      <span className={styles.meta}>{messageOf(pending ? 'STATUS_PENDING' : `ROLE_${org.myRole}`)}</span>
    </Link>
  );
}
