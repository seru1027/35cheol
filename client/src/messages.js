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

  // SCR-AUTH-01 화면별 제목·부제, 로그인 ↔ 회원가입 링크
  AUTH_LOGIN_TITLE: '다시 오셨네요',
  AUTH_LOGIN_SUB: '아이디와 비밀번호를 입력하세요.',
  AUTH_SIGNUP_TITLE: '35cheol 시작하기',
  AUTH_SIGNUP_SUB: '가입하면 초대 코드로 동아리에 들어갈 수 있어요.',
  AUTH_NO_ACCOUNT: '계정이 없나요?',
  AUTH_HAS_ACCOUNT: '이미 계정이 있나요?',
  LINK_SIGNUP: '회원가입',
  LINK_LOGIN: '로그인',

  // SCR-AUTH-01 버튼 (요청 중 문구) · 비밀번호 보기
  BUTTON_LOGIN: '로그인',
  BUTTON_LOGGING_IN: '로그인 중…',
  BUTTON_SIGNUP: '가입하기',
  BUTTON_SIGNING_UP: '가입 중…',
  PASSWORD_SHOW: '보기',
  PASSWORD_HIDE: '숨기기',

  // SCR-COMMON-01 공통 레이아웃
  BUTTON_LOGOUT: '로그아웃',
  BUTTON_LOGGING_OUT: '로그아웃 중…',
  SESSION_EXPIRED: '다시 로그인해 주세요', // 프론트 전용 (사용 중 401, 화면정의서 결정 D 문구 그대로)
  MY_ORGS_EMPTY: '가입한 동아리가 없습니다', // ORG-02 200 + 빈 배열
  MY_ORGS_LOAD_FAILED: '목록을 불러오지 못했습니다', // 햄버거바의 ORG-02 500·네트워크

  // SCR-ORG-01 메인 (Figma 03 문구 그대로). 프론트 전용
  MAIN_TITLE: '내 동아리', // 화면에는 안 보이는 h1 (본문 제목 줄 없음)
  CARD_CREATE_ORG: '동아리 만들기', // 03 와이어프레임의 '+'는 원 아이콘으로
  CARD_CREATE_ORG_DESC: '새 동아리의 회장이 됩니다',
  CARD_JOIN_ORG: '동아리 가입하기',
  CARD_JOIN_ORG_DESC: '초대 코드로 신청',
  ROLE_OWNER: '회장', // ORG-02 myRole → 화면 이름
  ROLE_ADMIN: '운영진',
  ROLE_MEMBER: '회원',
  STATUS_PENDING: '대기중', // myStatus PENDING (myRole은 null)

  // SCR-COMMON-02 공통 상태 패널 (Figma 03 문구 그대로). 프론트 전용
  LOADING: '불러오는 중…',
  PANEL_PENDING_TITLE: '가입 승인 대기중입니다',
  PANEL_PENDING_DESC: '회장·운영진이 승인하면 동아리를 볼 수 있어요.',
  PANEL_FORBIDDEN_TITLE: '권한이 없습니다',
  PANEL_FORBIDDEN_DESC: '회장·운영진만 볼 수 있는 페이지입니다.',
  PANEL_NOT_FOUND_TITLE: '페이지를 찾을 수 없습니다',
  PANEL_NOT_FOUND_DESC: '주소가 틀렸거나 볼 수 없는 동아리·공지입니다.',
  PANEL_ERROR_TITLE: '잠시 후 다시 시도하세요',
  PANEL_ERROR_DESC: '서버에 문제가 생겼습니다.',
  BUTTON_GO_MAIN: '메인으로',
  BUTTON_GO_ORG_HOME: '동아리 홈으로',
  BUTTON_RETRY: '다시 시도',

  // 공통
  INTERNAL_SERVER_ERROR: '잠시 후 다시 시도하세요',
  NETWORK_ERROR: '잠시 후 다시 시도하세요', // 프론트 전용 (api.js)
};

// 사전에 없는 코드는 예상하지 못한 실패로 보고 500과 같은 문구를 쓴다
export function messageOf(code) {
  return MESSAGES[code] ?? MESSAGES.INTERNAL_SERVER_ERROR;
}
