import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink, Outlet } from 'react-router';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { messageOf } from '../messages.js';
import styles from './AppLayout.module.css';

// 햄버거바 펼침 상태를 이 브라우저에 기억한다 (새로고침해도 유지). 저장소를 못 쓰는 환경(사생활 보호 창 등)이면 늘 펼침
const NAV_OPEN_KEY = '35cheol.navOpen';

function readNavOpen() {
  try {
    return localStorage.getItem(NAV_OPEN_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveNavOpen(open) {
  try {
    localStorage.setItem(NAV_OPEN_KEY, String(open));
  } catch {
    // 저장 못 해도 지금 화면에서는 동작한다
  }
}

// SCR-COMMON-01 공통 레이아웃: 햄버거바 + 상단바 + 본문 자리(<Outlet />)
// 로그인 이후 모든 화면을 감싼다. AUTH-03(로그인 사용자)은 auth.jsx, 여기서는 ORG-02·AUTH-04
// F4: 상단바 '> 동아리명', /orgs/:orgId 동아리 레이아웃
export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [orgs, setOrgs] = useState(undefined); // undefined: 응답 전, null: 실패, 배열: 내 동아리
  const [navOpen, setNavOpen] = useState(readNavOpen); // ② 햄버거바 펼침. 처음은 펼침, 접으면 기억
  const [orgsOpen, setOrgsOpen] = useState(true); // ④ 기본은 펼침
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null); // 프로필 아이콘 + 메뉴를 감싼 요소. 바깥 클릭 판단에 쓴다
  const profileButtonRef = useRef(null); // Esc로 닫은 뒤 포커스를 돌려줄 곳
  // 접기·펼치기 버튼 두 개. 누른 버튼이 사라지므로(접으면 햄버거바 쪽이 inert, 펼치면 상단바 ☰가 없어짐) 반대쪽 버튼으로 커서를 넘긴다
  const collapseButtonRef = useRef(null);
  const expandButtonRef = useRef(null);
  const moveFocusRef = useRef(false); // 버튼으로 바꿨을 때만 커서를 옮긴다 (처음 그릴 때는 옮기지 않음)

  // ④ 내 동아리 (ORG-02). F3에서 동아리 만들기·가입 신청 성공 뒤 다시 부르도록 본문 화면에 내려준다
  const loadOrgs = useCallback(async () => {
    const { status, data } = await api('/api/orgs');
    if (status === 200) setOrgs(data.orgs);
    else if (status !== 401) setOrgs(null); // 401은 api.js 공통 처리가 /login으로 보낸다
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  // ⑤ 바깥을 누르거나 Esc를 누르면 메뉴를 닫는다. 메뉴가 열려 있을 때만 document에 듣는 함수를 달고, 닫히면 뗀다
  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutside(event) {
      if (!profileRef.current.contains(event.target)) setMenuOpen(false);
    }
    // Esc: 키보드 사용자는 바깥을 누를 수 없다. 닫은 뒤 커서를 프로필 아이콘으로 돌려준다
    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      profileButtonRef.current.focus();
    }
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  // ② 햄버거바를 접고 펼친다. 본문이 그만큼 넓어진다 (Notion 방식)
  // 펼침: 햄버거바 맨 위 왼쪽의 접기 버튼 / 접힘: 상단바 맨 왼쪽의 ☰. 두 버튼이 화면의 같은 자리에 있어 버튼이 움직이지 않는 것처럼 보인다
  function toggleNav() {
    moveFocusRef.current = true;
    setNavOpen((open) => {
      saveNavOpen(!open);
      return !open;
    });
  }

  useEffect(() => {
    if (!moveFocusRef.current) return;
    moveFocusRef.current = false;
    (navOpen ? collapseButtonRef : expandButtonRef).current?.focus();
  }, [navOpen]);

  // ⑥ 로그아웃 (AUTH-04): 확인창 없이 요청 → 200이면 로그인 상태를 비운다 → RequireAuth가 /login으로
  async function logout() {
    setLoggingOut(true);
    const { status, code } = await api('/api/auth/logout', { method: 'POST' });
    setLoggingOut(false);
    if (status === 200) signOut();
    else toast.error(messageOf(code)); // 500·네트워크 (버튼 동작이라 토스트)
  }

  return (
    <div className={navOpen ? styles.layout : `${styles.layout} ${styles.layoutNavClosed}`}>
      {/* inert: 접혀 있을 때 안의 링크에 Tab·화면 읽기 프로그램이 들어가지 않는다 (보이지 않는 곳에 커서가 가지 않게) */}
      <nav id="app-nav" className={styles.sidebar} aria-label="메뉴" inert={!navOpen}>
        <div className={styles.sidebarInner}>
          {/* 맨 위 줄: 상단바와 같은 높이. 접기 버튼은 왼쪽 끝 (펼쳤을 때 ☰가 있던 자리) */}
          <div className={styles.sidebarTop}>
            <button
              type="button"
              ref={collapseButtonRef}
              className={styles.navToggle}
              // 이름은 '메뉴' 하나로 두고 상태는 aria-expanded가 알린다 ('메뉴, 펼쳐짐'). 마우스에는 title로 할 일을 보여 준다
              aria-label="메뉴"
              aria-expanded={navOpen}
              aria-controls="app-nav"
              title="메뉴 접기"
              onClick={toggleNav}
            >
              <SidebarIcon />
            </button>
          </div>
          {/* ③ 홈. NavLink는 지금 주소와 같으면 isActive가 true (end: /orgs/1에서는 홈이 활성으로 보이지 않게) */}
          <NavLink to="/" end className={rowClass(styles.navItem)}>홈</NavLink>
          {/* ④ 내 동아리 ▾ */}
          <button
            type="button"
            className={styles.navItem}
            aria-expanded={orgsOpen}
            onClick={() => setOrgsOpen((open) => !open)}
          >
            내 동아리 <span aria-hidden="true">{orgsOpen ? '▾' : '▸'}</span>
          </button>
          {orgsOpen && <OrgList orgs={orgs} />}
        </div>
      </nav>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            {/* ② ☰ 메뉴 펼치기: 햄버거바가 접혔을 때만 상단바 맨 왼쪽에 */}
            {!navOpen && (
              <button
                type="button"
                ref={expandButtonRef}
                className={styles.navToggle}
                aria-label="메뉴"
                aria-expanded={navOpen}
                aria-controls="app-nav"
                title="메뉴 펼치기"
                onClick={toggleNav}
              >
                <MenuIcon />
              </button>
            )}
            {/* ① 서비스명 → 메인 */}
            <Link to="/" className={styles.serviceName}>35cheol</Link>
          </div>

          {/* ⑤ 프로필 아이콘 → ⑥ 프로필 메뉴 */}
          <div className={styles.profile} ref={profileRef}>
            <button
              type="button"
              ref={profileButtonRef}
              className={styles.profileButton}
              aria-label="프로필 메뉴"
              aria-expanded={menuOpen}
              aria-controls="profile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {user.name.slice(0, 1)}
            </button>
            {menuOpen && (
              <div id="profile-menu" className={styles.menu}>
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

// ☰ 아이콘: 선 세 개. 색은 버튼 글자색(currentColor)을 따른다. 굵기 1.5는 옆 글자(400)와 맞춤
function MenuIcon() {
  return (
    <svg className={styles.menuIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 접기 아이콘: 왼쪽에 칸이 있는 창 모양 (Notion·브라우저의 '사이드바 숨기기'와 같은 뜻)
function SidebarIcon() {
  return (
    <svg className={styles.menuIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.75 3.75v12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// 햄버거바 행의 className. 지금 보고 있는 화면의 행은 파랑으로 표시한다 (DESIGN.md ex-app-shell-row: active indicator = primary)
function rowClass(base) {
  return ({ isActive }) => (isActive ? `${base} ${styles.rowActive}` : base);
}
