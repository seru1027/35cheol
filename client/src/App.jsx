import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  // 앱 시작 때 로그인 상태 확인 (AUTH-03)
  // F0은 결과를 콘솔에만 찍는다. F2(공통 레이아웃)에서 로그인 상태 판단으로 키운다
  useEffect(() => {
    api('/api/auth/me').then((result) => console.log('[AUTH-03]', result));
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
