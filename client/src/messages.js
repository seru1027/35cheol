// 응답 code → 화면 문구 사전 (API 명세서 0-2: message는 항상 null, 문구는 프론트가 code로 정한다)
// 서버 코드와 프론트가 만든 코드(NETWORK_ERROR, PASSWORD_MISMATCH)를 한곳에 둔다
const MESSAGES = {
  // AUTH-01 회원가입
  REQUIRED_LOGIN_ID: '아이디를 입력하세요',
  INVALID_LOGIN_ID_TYPE: '입력값을 확인하세요',
  INVALID_LOGIN_ID_LENGTH: '아이디는 4~20자로 입력하세요',
  INVALID_LOGIN_ID_FORMAT: '아이디는 영문과 숫자만 쓸 수 있습니다',
  LOGIN_ID_ALREADY_EXISTS: '이미 사용 중인 아이디입니다',
  REQUIRED_NAME: '이름을 입력하세요',
  INVALID_NAME_TYPE: '입력값을 확인하세요',
  INVALID_NAME_LENGTH: '이름은 20자 이하로 입력하세요',
  REQUIRED_PASSWORD: '비밀번호를 입력하세요',
  INVALID_PASSWORD_TYPE: '입력값을 확인하세요',
  INVALID_PASSWORD_LENGTH: '비밀번호는 8~64자로 입력하세요',
  INVALID_PASSWORD_FORMAT: '비밀번호에는 공백과 한글을 쓸 수 없습니다',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다', // 프론트 전용
  SIGNUP_SUCCESS: '가입이 완료되었어요. 로그인해 주세요',

  // AUTH-02 로그인
  LOGIN_FIELDS_REQUIRED: '아이디와 비밀번호를 입력하세요', // 프론트 전용 (빈 칸이면 요청하지 않음)
  INVALID_LOGIN_ID_OR_PASSWORD: '아이디 또는 비밀번호가 올바르지 않습니다',

  // SCR-COMMON-01 공통 레이아웃
  SESSION_EXPIRED: '다시 로그인해 주세요', // 프론트 전용 (사용 중 401, 화면정의서 결정 D 문구 그대로)
  MY_ORGS_EMPTY: '가입한 동아리가 없습니다', // ORG-02 200 + 빈 배열
  MY_ORGS_LOAD_FAILED: '목록을 불러오지 못했습니다', // 햄버거바의 ORG-02 500·네트워크

  // 공통
  INTERNAL_SERVER_ERROR: '잠시 후 다시 시도하세요',
  NETWORK_ERROR: '잠시 후 다시 시도하세요', // 프론트 전용 (api.js)
};

// 사전에 없는 코드는 예상하지 못한 실패로 보고 500과 같은 문구를 쓴다
export function messageOf(code) {
  return MESSAGES[code] ?? MESSAGES.INTERNAL_SERVER_ERROR;
}
