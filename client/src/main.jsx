import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';

// BrowserRouter: 주소창의 경로(/login 등)를 읽어 App 안의 <Routes>가 화면을 고르게 한다
// AuthProvider: 로그인 사용자를 App 아래 어디서든 useAuth()로 읽게 한다. <Navigate>를 쓰므로 BrowserRouter 안에 둔다
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
