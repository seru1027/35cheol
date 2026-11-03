// 화면 검사. 서버 server/src/utils/validate.js와 같은 규칙·같은 코드를 내서, 문구 사전 하나로 둘 다 처리한다
// 화면 검사는 사용자 편의일 뿐이고, 진짜 검사는 서버가 한다 (화면 검사를 건너뛴 요청도 서버가 막음)

// 문자열 입력 하나를 REQUIRED → TYPE → LENGTH → FORMAT 순서로 검사한다 (API 명세서 0-3)
// 통과 → { value: 정리된 값, code: null }, 실패 → { value: null, code: 처음 걸린 코드 }
// trim: false면 비밀번호 규칙. 공백을 지우지 않고, 빈 문자열만 REQUIRED, 길이도 입력 그대로 센다
export function validateString(value, {
  field, min = 0, max = Infinity, pattern, trim = true, lowercase = false,
}) {
  const fail = (code) => ({ value: null, code });

  let str = value;
  if (typeof str === 'string') {
    if (trim) str = str.trim();
    if (lowercase) str = str.toLowerCase();
  }

  if (str === undefined || str === null || str === '') {
    return fail(`REQUIRED_${field}`);
  }

  if (typeof str !== 'string') {
    return fail(`INVALID_${field}_TYPE`);
  }

  // 글자 수는 코드 포인트로 센다 (서버·DB와 같은 기준). str.length는 이모지를 2로 셈
  const length = [...str].length;
  if (length < min || length > max) {
    return fail(`INVALID_${field}_LENGTH`);
  }

  if (pattern && !pattern.test(str)) {
    return fail(`INVALID_${field}_FORMAT`);
  }

  return { value: str, code: null };
}

// AUTH-01 회원가입 폼 전체 검사 (화면정의서 결정 H: 가입하기를 누를 때 한 번에)
// 서버와 달리 첫 오류 하나가 아니라 칸마다 오류를 모아 { 칸 이름: 코드 }로 돌려준다. 오류가 없으면 빈 객체
export function validateSignup({ loginId, name, password, passwordConfirm }) {
  const errors = {};

  const id = validateString(loginId, {
    field: 'LOGIN_ID', min: 4, max: 20, pattern: /^[a-z0-9]+$/, lowercase: true,
  });
  if (id.code) errors.loginId = id.code;

  const nm = validateString(name, { field: 'NAME', min: 1, max: 20 });
  if (nm.code) errors.name = nm.code;

  const pw = validateString(password, {
    field: 'PASSWORD', min: 8, max: 64, pattern: /^[\x21-\x7E]+$/, trim: false,
  });
  if (pw.code) errors.password = pw.code;

  // 비밀번호 확인은 화면에서만 비교하고 서버로 보내지 않는다 (화면정의서 ⑪)
  if (password !== passwordConfirm) errors.passwordConfirm = 'PASSWORD_MISMATCH';

  return errors;
}
