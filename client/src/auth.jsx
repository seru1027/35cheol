import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { api, setUnauthorizedHandler } from './api.js';

// 로그인 사용자를 앱 전체가 함께 쓰는 곳 (React Context)
// LoginPage(레이아웃 밖)와 AppLayout(레이아웃)이 모두 읽고 바꾸므로, props로 내려주지 않고 Context에 둔다
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading: AUTH-03 응답 전, failed: 500·네트워크, ready: 판단 끝
  const [user, setUser] = useState(null); // null: 로그인 안 됨, { userId, loginId, name }: 로그인됨
  const [sessionExpired, setSessionExpired] = useState(false); // 사용 중 401로 로그아웃됨 → 로그인 화면에 안내

  // 앱 시작·새로고침 때 한 번 (AUTH-03). 이 401은 "아직 로그인 안 함"이라 공통 처리(안내 문구)를 건너뛴다
  const checkMe = useCallback(async () => {
    setStatus('loading');
    const result = await api('/api/auth/me', { skipAuthRedirect: true });
    if (result.status === 200) {
      setUser(result.data);
      setStatus('ready');
    } else if (result.status === 401) {
      setUser(null);
      setStatus('ready');
    } else {
      setStatus('failed'); // 서버 꺼짐은 로그아웃이 아니다 → /login이 아니라 [다시 시도] (F2 결정 5)
    }
  }, []);

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  // api.js에 공통 401 처리 함수를 맡긴다. 화면 이동은 하지 않고 로그인 상태만 바꾼다
  // → user가 null이 되면 RequireAuth가 /login으로 보낸다 (이동하는 곳을 한 곳으로 모은다)
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null); // 정리: 이 컴포넌트가 사라지면 맡긴 함수도 거둔다
  }, []);

  const value = {
    status,
    user,
    sessionExpired,
    retry: checkMe,
    // 로그인 성공 (AUTH-02 응답 data가 AUTH-03과 같은 모양)
    signIn(nextUser) {
      setUser(nextUser);
      setSessionExpired(false);
    },
    // 로그아웃 성공 (AUTH-04). 스스로 나간 것이라 안내 문구 없음
    signOut() {
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// 보호 라우트: 로그인한 사람만. 아니면 /login (뒤로 가기로 돌아오지 않게 replace)
export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// 로그인 화면은 로그인 안 한 사람만. 로그인 상태로 들어오거나 로그인에 성공하면 / (화면정의서: 로그인 후에는 항상 /)
export function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}
