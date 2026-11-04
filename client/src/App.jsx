import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router';
import { GuestOnly, RequireAuth, useAuth } from './auth.jsx';
import AppLayout, { AppStart } from './pages/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

// 토스트 모양 (client/DESIGN.md toast: 어두운 바탕, 그림자 없음, 성공 파랑·오류 빨강)
// 라이브러리가 기본 모양을 인라인 style로 넣어서 .module.css로는 덮을 수 없다. 그래서 style 객체로 넘기되 값은 var(--...)만 쓴다
const TOAST_OPTIONS = {
  duration: 3000,
  style: {
    background: 'var(--color-ink)',
    color: 'var(--color-on-primary)',
    boxShadow: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    font: 'var(--type-caption) var(--font-sans)',
    letterSpacing: 'var(--tracking-snug)',
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
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          {/* 중첩 라우트: path 없는 부모가 레이아웃을 그리고, 자식 화면은 레이아웃 안의 <Outlet /> 자리에 들어간다 */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      ) : (
        <AppStart failed={status === 'failed'} onRetry={retry} />
      )}
      {/* 화면을 옮겨도 토스트가 남도록 라우트 밖에 하나만 둔다 (화면정의서: 결과 알림은 화면을 옮겨도 보여야 함) */}
      <Toaster position="bottom-right" toastOptions={TOAST_OPTIONS} />
    </>
  );
}
