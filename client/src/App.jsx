import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router';
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';

// 토스트 모양 (client/DESIGN.md Project Components: 어두운 바탕, 그림자 없음, 성공 파랑·오류 빨강)
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
  // 앱 시작 때 로그인 상태 확인 (AUTH-03)
  // F0은 결과를 콘솔에만 찍는다. F2(공통 레이아웃)에서 로그인 상태 판단으로 키운다
  useEffect(() => {
    api('/api/auth/me').then((result) => console.log('[AUTH-03]', result));
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      {/* 화면을 옮겨도 토스트가 남도록 라우트 밖에 하나만 둔다 (화면정의서: 결과 알림은 화면을 옮겨도 보여야 함) */}
      <Toaster position="bottom-right" toastOptions={TOAST_OPTIONS} />
    </>
  );
}
