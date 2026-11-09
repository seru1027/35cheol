import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';

// 데이터 라우터: 주소창의 경로(/login 등)를 읽어 App 안의 <Routes>가 화면을 고르게 한다
// <BrowserRouter> 대신 이걸 쓰는 이유: 작성 중 이탈 확인(useBlocker)이 데이터 라우터에서만 동작한다 (F5, 2026-11-09)
// 라우트는 '모든 주소' 하나만 두고, 실제 화면 고르기는 지금처럼 App.jsx의 <Routes>가 한다 (구조는 그대로)
// AuthProvider: 로그인 사용자를 App 아래 어디서든 useAuth()로 읽게 한다. <Navigate>를 쓰므로 라우터 안에 둔다
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
