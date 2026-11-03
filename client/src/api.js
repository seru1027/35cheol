// 백엔드 주소 (.env의 VITE_API_URL). 빌드할 때 문자열로 바뀌어 코드에 들어간다
const API_URL = import.meta.env.VITE_API_URL;

// 모든 API 호출이 지나는 함수. 응답(명세 0-2)에서 { status, code, data }만 꺼내 돌려준다
// 화면은 code로 분기하고 문구를 고른다 (message는 항상 null)
export async function api(path, { method = 'GET', body } = {}) {
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

  // F2: 401 UNAUTHORIZED → /login 이동 (로그인 API의 INVALID_LOGIN_ID_OR_PASSWORD는 빼야 함), 500 → 토스트

  return { status: json.status, code: json.code, data: json.data };
}
