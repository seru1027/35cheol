import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const logoutRef = useRef(null);
  const menuByKeyboardRef = useRef(false); // Enter·Space로 열었을 때만 첫 항목으로 커서를 옮긴다
  // 접기·펼치기 버튼 두 개. 누른 버튼이 사라지므로(접으면 햄버거바 쪽이 inert, 펼치면 상단바 ☰가 없어짐) 반대쪽 버튼으로 커서를 넘긴다
  const collapseButtonRef = useRef(null);
  const expandButtonRef = useRef(null);
  const moveFocusRef = useRef(false); // 버튼으로 바꿨을 때만 커서를 옮긴다 (처음 그릴 때는 옮기지 않음)

  // ④ 내 동아리 (ORG-02). 햄버거바와 메인(SCR-ORG-01)이 같은 목록을 쓴다: 여기서 한 번 불러 본문 화면에 내려준다
  // 다시 부르는 방식 두 가지
  //   showLoading: true  → [다시 시도]. 목록을 비워 '불러오는 중…'을 보여 준 뒤 다시 요청 (눌린 것이 보이게)
  //   showLoading: false → 동아리 만들기·가입 신청 성공 뒤. 기존 목록을 둔 채 새 응답으로 바꾼다 (목록이 깜빡이지 않게)
  const loadOrgs = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setOrgs(undefined);
    const { status, data } = await api('/api/orgs');
    if (status === 200) setOrgs(data.orgs);
    else if (status !== 401) setOrgs(null); // 401은 api.js 공통 처리가 /login으로 보낸다
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  // 화면에 보여줄 순서: 대기중(PENDING)을 맨 뒤로. 햄버거바와 메인이 같은 순서를 쓰도록 여기서 한 번만 정렬해 내려준다
  // useMemo: orgs가 바뀔 때만 다시 정렬한다 (메뉴를 여닫는 등 다른 state로 다시 그릴 때는 이전 결과를 그대로 씀)
  // undefined(응답 전)·null(실패)은 그대로 넘긴다
  const sortedOrgs = useMemo(() => (Array.isArray(orgs) ? sortPendingLast(orgs) : orgs), [orgs]);

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

  // 키보드로 메뉴를 열면 커서를 첫 항목(로그아웃)으로. 마우스로 열 때는 커서를 옮기지 않는다
  useEffect(() => {
    if (!menuOpen || !menuByKeyboardRef.current) return;
    menuByKeyboardRef.current = false;
    logoutRef.current?.focus();
  }, [menuOpen]);

  // 프로필 아이콘을 누름. 키보드(Enter·Space)로 누르면 click 이벤트의 detail이 0이다 (마우스는 누른 횟수 1 이상)
  function toggleProfileMenu(event) {
    menuByKeyboardRef.current = event.detail === 0;
    setMenuOpen((open) => !open);
  }

  // ⑥ 로그아웃 (AUTH-04): 확인창 없이 요청 → 200이면 로그인 상태를 비운다 → RequireAuth가 /login으로
  async function logout() {
    setLoggingOut(true);
    const { status, code } = await api('/api/auth/logout', { method: 'POST' });
    setLoggingOut(false);
    if (status === 200) signOut();
    else toast.error(messageOf(code)); // 500·네트워크 (버튼 동작이라 토스트)
  }

  return (
    // id="app-shell": 모달이 열린 동안 이 안 전체에 inert를 건다 (components/Modal.jsx). 모달은 이 밖(body)에 그려진다
    <div id="app-shell" className={navOpen ? styles.layout : `${styles.layout} ${styles.layoutNavClosed}`}>
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
          {/* 성격이 다른 항목은 묶음(section)으로 나누고 묶음 사이를 띄운다: 이동(홈) / 내 동아리 목록 */}
          <div className={styles.navSection}>
            {/* ③ 홈. NavLink는 지금 주소와 같으면 isActive가 true (end: /orgs/1에서는 홈이 활성으로 보이지 않게) */}
            <NavLink to="/" end className={rowClass(styles.navItem)}>홈</NavLink>
          </div>
          <div className={styles.navSection}>
            {/* ④ 내 동아리 ▾: 묶음 제목. 아래 행들보다 작고 흐린 글자로 '제목'임을 보인다 (Notion '개인 페이지', Claude 프로젝트 이름처럼) */}
            <button
              type="button"
              className={`${styles.navItem} ${styles.sectionLabel}`}
              aria-expanded={orgsOpen}
              onClick={() => setOrgsOpen((open) => !open)}
            >
              내 동아리 <span aria-hidden="true">{orgsOpen ? '▾' : '▸'}</span>
            </button>
            {orgsOpen && <OrgList orgs={sortedOrgs} />}
          </div>
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
              onClick={toggleProfileMenu}
            >
              {user.name.slice(0, 1)}
            </button>
            {menuOpen && (
              <div id="profile-menu" className={styles.menu}>
                {/* 머리: 아바타 + 이름·아이디. 누구로 로그인했는지 한눈에 (Notion·Claude 계정 메뉴처럼) */}
                <div className={styles.menuHeader}>
                  <span className={styles.avatar} aria-hidden="true">{user.name.slice(0, 1)}</span>
                  <div className={styles.menuWho}>
                    <p className={styles.menuName}>{user.name}</p>
                    <p className={styles.menuId}>{user.loginId}</p>
                  </div>
                </div>
                <hr className={styles.menuDivider} />
                <button type="button" ref={logoutRef} className={styles.menuItem} onClick={logout} disabled={loggingOut}>
                  <LogoutIcon />
                  {/* 요청 중에는 문구로도 알린다 (로그인 버튼과 같은 규칙) */}
                  {messageOf(loggingOut ? 'BUTTON_LOGGING_OUT' : 'BUTTON_LOGOUT')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ⑧ 본문 자리. 자식 라우트의 화면이 여기에 들어간다. 동아리 목록과 다시 불러오기를 함께 넘긴다 */}
        <main className={styles.content}>
          <Outlet context={{ orgs: sortedOrgs, reloadOrgs: loadOrgs }} />
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

// 로그아웃 아이콘: 문에서 오른쪽으로 나가는 화살표. 굵기 1.5 (옆 글자 400과 맞춤)
function LogoutIcon() {
  return (
    <svg className={styles.itemIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M8 3.75H5.25a1.5 1.5 0 0 0-1.5 1.5v9.5a1.5 1.5 0 0 0 1.5 1.5H8M12.5 6.5 16 10l-3.5 3.5M16 10H8"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
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

// 대기중(PENDING)을 맨 뒤로. 화면정의서는 'ORG-02 정렬 그대로'지만, 들어갈 수 있는 동아리를 앞에 모은다 (2026-11-05 결정)
// sort는 비교 결과가 0이면 원래 순서를 지킨다(안정 정렬) → ACTIVE끼리·PENDING끼리는 서버 순서(신청 시각) 그대로
// [...orgs]로 복사해서 정렬한다: sort는 배열 자체를 바꾸는데, orgs는 state라 직접 바꾸면 안 된다
function sortPendingLast(orgs) {
  const isPending = (org) => (org.myStatus === 'PENDING' ? 1 : 0);
  return [...orgs].sort((a, b) => isPending(a) - isPending(b));
}

// 햄버거바 행의 className. 지금 보고 있는 화면의 행은 파랑으로 표시한다 (DESIGN.md ex-app-shell-row: active indicator = primary)
function rowClass(base) {
  return ({ isActive }) => (isActive ? `${base} ${styles.rowActive}` : base);
}
