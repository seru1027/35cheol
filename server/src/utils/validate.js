// 문자열 입력 하나를 REQUIRED → TYPE → LENGTH → FORMAT 순서로 검사한다 (API 명세서 0-3)
// 통과 → { value: 정리된 값, code: null }, 실패 → { value: null, code: 처음 걸린 코드 }
// field: 코드에 들어갈 이름 ('LOGIN_ID' → REQUIRED_LOGIN_ID, INVALID_LOGIN_ID_TYPE ...)
// trim: false면 비밀번호 규칙. 공백을 지우지 않고, 빈 문자열만 REQUIRED, 길이도 입력 그대로 센다
// min·max·pattern을 넘기지 않으면 그 검사를 건너뛴다 (AUTH-02 로그인은 REQUIRED·TYPE만)
function validateString(value, { field, min = 0, max = Infinity, pattern, trim = true, lowercase = false }) {
  const fail = (code) => ({ value: null, code });

  // 정리는 문자열일 때만. 아이디는 공백 제거 후 소문자로 바꾼 값으로 검사·저장한다
  let str = value;
  if (typeof str === 'string') {
    if (trim) str = str.trim();
    if (lowercase) str = str.toLowerCase();
  }

  // REQUIRED: 없음·null·빈 문자열 (trim이면 공백뿐인 값도 여기서 빈 문자열)
  if (str === undefined || str === null || str === '') {
    return fail(`REQUIRED_${field}`);
  }

  if (typeof str !== 'string') {
    return fail(`INVALID_${field}_TYPE`);
  }

  // 글자 수는 코드 포인트로 센다: DB VARCHAR와 같은 기준 (D7). str.length는 이모지를 2로 셈
  const length = [...str].length;
  if (length < min || length > max) {
    return fail(`INVALID_${field}_LENGTH`);
  }

  if (pattern && !pattern.test(str)) {
    return fail(`INVALID_${field}_FORMAT`);
  }

  return { value: str, code: null };
}

module.exports = { validateString };
