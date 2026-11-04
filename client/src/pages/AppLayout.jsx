import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink, Outlet } from 'react-router';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { messageOf } from '../messages.js';
import styles from './AppLayout.module.css';

// SCR-COMMON-01 공통 레이아웃: 햄버거바 + 상단바 + 본문 자리(<Outlet />)
// 로그인 이후 모든 화면을 감싼다. AUTH-03(로그인 사용자)은 auth.jsx, 여기서는 ORG-02·AUTH-04
// F4: 상단바 '> 동아리명', /orgs/:orgId 동아리 레이아웃
export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [orgs, setOrgs] = useState(undefined); // undefined: 응답 전, null: 실패, 배열: 내 동아리
  const [orgsOpen, setOrgsOpen] = useState(true); // ④ 기본은 펼침
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null); // 프로필 아이콘 + 메뉴를 감싼 요소. 바깥 클릭 판단에 쓴다

  // ④ 내 동아리 (ORG-02). F3에서 동아리 만들기·가입 신청 성공 뒤 다시 부르도록 본문 화면에 내려준다
  const loadOrgs = useCallback(async () => {
    const { status, data } = await api('/api/orgs');
    if (status === 200) setOrgs(data.orgs);
    else if (status !== 401) setOrgs(null); // 401은 api.js 공통 처리가 /login으로 보낸다
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  // ⑤ 바깥을 누르면 메뉴를 닫는다. 메뉴가 열려 있을 때만 document에 듣는 함수를 달고, 닫히면 뗀다
  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutside(event) {
      if (!profileRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [menuOpen]);

  // ⑥ 로그아웃 (AUTH-04): 확인창 없이 요청 → 200이면 로그인 상태를 비운다 → RequireAuth가 /login으로
  async function logout() {
    setLoggingOut(true);
    const { status, code } = await api('/api/auth/logout', { method: 'POST' });
    setLoggingOut(false);
    if (status === 200) signOut();
    else toast.error(messageOf(code)); // 500·네트워크 (버튼 동작이라 토스트)
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar} aria-label="메뉴">
        <p className={styles.sidebarTitle}>☰ 메뉴</p>
        {/* ③ 홈. NavLink는 지금 주소와 같으면 isActive가 true (end: /orgs/1에서는 홈이 활성으로 보이지 않게) */}
        <NavLink to="/" end className={rowClass(styles.navItem)}>홈</NavLink>
        {/* ④ 내 동아리 ▾ */}
        <button
          type="button"
          className={styles.navItem}
          aria-expanded={orgsOpen}
          onClick={() => setOrgsOpen((open) => !open)}
        >
          내 동아리 {orgsOpen ? '▾' : '▸'}
        </button>
        {orgsOpen && <OrgList orgs={orgs} />}
      </nav>

      <div className={styles.main}>
        <header className={styles.header}>
          {/* ① 서비스명 → 메인 */}
          <Link to="/" className={styles.serviceName}>35cheol</Link>

          {/* ⑤ 프로필 아이콘 → ⑥ 프로필 메뉴 */}
          <div className={styles.profile} ref={profileRef}>
            <button
              type="button"
              className={styles.profileButton}
              aria-label="프로필 메뉴"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {user.name.slice(0, 1)}
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <p className={styles.menuName}>{user.name}</p>
                <p className={styles.menuId}>{user.loginId}</p>
                <hr className={styles.menuDivider} />
                <button type="button" className={styles.logout} onClick={logout} disabled={loggingOut}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ⑧ 본문 자리. 자식 라우트의 화면이 여기에 들어간다. 동아리 목록과 다시 불러오기를 함께 넘긴다 */}
        <main className={styles.content}>
          <Outlet context={{ orgs, reloadOrgs: loadOrgs }} />
        </main>
      </div>
    </div>
  );
}

// ④ 펼친 목록. ACTIVE·PENDING 모두 /orgs/:orgId로 간다 (PENDING은 그 화면에서 '승인 대기중', F4)
function OrgList({ orgs }) {
  if (orgs === undefined) return null; // 응답 전에는 비워 둔다 (짧고, 본문 로딩과 겹치지 않게)
  if (orgs === null) return <p className={styles.orgNote}>{messageOf('MY_ORGS_LOAD_FAILED')}</p>;
  if (orgs.length === 0) return <p className={styles.orgNote}>{messageOf('MY_ORGS_EMPTY')}</p>;

  return (
    <ul className={styles.orgList}>
      {orgs.map((org) => (
        <li key={org.orgId}>
          <NavLink
            to={`/orgs/${org.orgId}`}
            className={rowClass(org.myStatus === 'PENDING' ? `${styles.org} ${styles.orgPending}` : styles.org)}
          >
            {org.myStatus === 'PENDING' ? `${org.name} · 대기중` : org.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

// 햄버거바 행의 className. 지금 보고 있는 화면의 행은 파랑으로 표시한다 (DESIGN.md ex-app-shell-row: active indicator = primary)
function rowClass(base) {
  return ({ isActive }) => (isActive ? `${base} ${styles.rowActive}` : base);
}

// 앱 시작 상태 (화면 전체): AUTH-03 응답 전 '불러오는 중…', 500·네트워크면 [다시 시도]
// F2-2에서 공통 상태 패널(SCR-COMMON-02)로 바꾼다
export function AppStart({ failed, onRetry }) {
  return (
    <div className={styles.appStart}>
      {failed ? (
        <>
          <p className={styles.appStartText}>{messageOf('INTERNAL_SERVER_ERROR')}</p>
          <button type="button" className={styles.retry} onClick={onRetry}>다시 시도</button>
        </>
      ) : (
        <p className={styles.appStartText}>불러오는 중…</p>
      )}
    </div>
  );
}
