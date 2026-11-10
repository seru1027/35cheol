import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router';
import { GuestOnly, RequireAuth, useAuth } from './auth.jsx';
import StatusPanel from './components/StatusPanel.jsx';
import AppLayout from './pages/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MainPage from './pages/MainPage.jsx';
import MemberListPage from './pages/MemberListPage.jsx';
import NoticeDetailPage from './pages/NoticeDetailPage.jsx';
import NoticeFormPage from './pages/NoticeFormPage.jsx';
import NoticeListPage from './pages/NoticeListPage.jsx';
import OrgHomePage from './pages/OrgHomePage.jsx';
import OrgLayout from './pages/OrgLayout.jsx';

// 토스트 모양 (client/DESIGN.md toast: 흰 카드 + Level 2 그림자, 성공 파랑·오류 빨강)
// 라이브러리가 기본 모양을 인라인 style로 넣어서 .module.css로는 덮을 수 없다. 그래서 style 객체로 넘기되 값은 var(--...)만 쓴다
const TOAST_OPTIONS = {
  duration: 3000,
  style: {
    background: 'var(--color-canvas)',
    color: 'var(--color-ink)',
    border: 'var(--border-width) solid var(--color-hairline)',
    boxShadow: 'var(--shadow-2)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-sm) var(--space-md)',
    font: 'var(--type-caption) var(--font-sans)',
  },
  success: { iconTheme: { primary: 'var(--color-primary)', secondary: 'var(--color-on-primary)' } },
  error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-on-primary)' } },
};

export default function App() {
  const { status, retry } = useAuth();

  return (
    <>
      {/* AUTH-03 응답 전에는 라우트를 그리지 않는다: 로그인 여부를 모르는 채로 로그인 화면이나 빈 상단바가 깜빡이지 않게 */}
      {status === 'ready' ? (
        <Routes>
          {/* 로그인·회원가입은 같은 컴포넌트. key가 달라야 주소를 옮길 때 입력값·상태가 새로 시작된다 */}
          <Route path="/login" element={<GuestOnly><LoginPage key="login" mode="login" /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><LoginPage key="signup" mode="signup" /></GuestOnly>} />
          {/* 중첩 라우트: path 없는 부모가 레이아웃을 그리고, 자식 화면은 레이아웃 안의 <Outlet /> 자리에 들어간다 */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<MainPage />} />
            {/* 두 번째 겹: 동아리 레이아웃(SCR-ORG-00)이 ORG-03을 한 번 부르고, 자식 화면을 자기 <Outlet /> 자리에 그린다 */}
            <Route path="orgs/:orgId" element={<OrgLayout />}>
              <Route index element={<OrgHomePage />} />
              <Route path="notices" element={<NoticeListPage />} />
              {/* new는 :noticeId보다 먼저 맞춰진다 (고정 경로가 변수 경로보다 우선) */}
              {/* 작성·수정은 같은 컴포넌트. key가 달라야 작성 ↔ 수정으로 옮길 때 입력값이 새로 시작된다 */}
              <Route path="notices/new" element={<NoticeFormPage key="new" />} />
              <Route path="notices/:noticeId" element={<NoticeDetailPage />} />
              <Route path="notices/:noticeId/edit" element={<NoticeFormPage key="edit" />} />
              <Route path="members" element={<MemberListPage />} />
              {/* 없는 하위 화면(가입 신청 등): ORG-03을 통과한 뒤 그 자리에 404 패널 */}
              <Route path="*" element={<StatusPanel kind="notFound" titleAs="h1" />} />
            </Route>
            {/* ④ 정의되지 않은 URL → 404 패널. 레이아웃 안에 두어서, 로그아웃 상태면 RequireAuth가 먼저 /login으로 보낸다 */}
            <Route path="*" element={<StatusPanel kind="notFound" titleAs="h1" />} />
          </Route>
        </Routes>
      ) : (
        // 앱 시작 (레이아웃 밖, 화면 전체): AUTH-03 응답 전 ① 로딩, 500·네트워크면 ⑤ [다시 시도] = AUTH-03 다시 요청
        <StatusPanel kind={status === 'failed' ? 'error' : 'loading'} onRetry={retry} fullScreen titleAs="h1" />
      )}
      {/* 화면을 옮겨도 토스트가 남도록 라우트 밖에 하나만 둔다 (화면정의서: 결과 알림은 화면을 옮겨도 보여야 함) */}
      <Toaster position="bottom-right" toastOptions={TOAST_OPTIONS} />
    </>
  );
}
