// 백엔드 주소 (.env의 VITE_API_URL). 빌드할 때 문자열로 바뀌어 코드에 들어간다
const API_URL = import.meta.env.VITE_API_URL;

// 공통 401 처리 함수. api.js는 React 컴포넌트가 아니라서 useNavigate·state를 직접 쓸 수 없다
// 그래서 React 쪽(auth.jsx의 AuthProvider)이 앱 시작 때 함수를 하나 맡겨 두고, 401이 오면 그 함수를 부른다
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// 모든 API 호출이 지나는 함수. 응답(명세 0-2)에서 { status, code, data }만 꺼내 돌려준다
// 화면은 code로 분기하고 문구를 고른다 (message는 항상 null)
// skipAuthRedirect: 401이 와도 공통 처리를 하지 않는다. 앱 시작 때의 AUTH-03만 쓴다 (그 401은 "아직 로그인 안 함"이라 문구 없이 /login)
export async function api(path, { method = 'GET', body, skipAuthRedirect = false } = {}) {
  let json;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      // 다른 출처(4000)로 가는 요청에도 쿠키를 싣고, 응답의 Set-Cookie를 받는다 (명세 0-1)
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    json = await res.json();
  } catch {
    // 서버 꺼짐·CORS 차단(fetch 실패), JSON이 아닌 응답(res.json 실패)
    // 서버가 주는 코드가 아니라 프론트가 붙인 이름이다
    return { status: 0, code: 'NETWORK_ERROR', data: null };
  }

  // 사용 중 401 → 로그인 화면 + '다시 로그인해 주세요' (화면정의서 결정 D)
  // status가 아니라 code로 본다: 로그인 API의 401은 INVALID_LOGIN_ID_OR_PASSWORD라 여기에 걸리지 않는다
  if (json.code === 'UNAUTHORIZED' && !skipAuthRedirect) {
    onUnauthorized?.();
  }
  // 500·네트워크는 여기서 토스트를 띄우지 않는다: 조회는 화면의 오류 패널, 버튼 동작은 각 화면이 토스트 (F2 결정 6)

  return { status: json.status, code: json.code, data: json.data };
}
