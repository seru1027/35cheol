import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { messageOf } from '../messages.js';
import { validateSignup } from '../validate.js';
import styles from './LoginPage.module.css';

// SCR-AUTH-01 로그인 / 회원가입 (한 화면, 탭 전환. URL은 /login 그대로)
// 로그인(AUTH-02)과 회원가입(AUTH-01)
// 로그인 상태로 들어오면 / 로 보내는 것과 AUTH-03 응답 전에 그리지 않는 것은 App.jsx·auth.jsx(GuestOnly)가 맡는다

const EMPTY_LOGIN = { loginId: '', password: '' };
const EMPTY_SIGNUP = { loginId: '', name: '', password: '', passwordConfirm: '' };
const SIGNUP_ORDER = ['loginId', 'name', 'password', 'passwordConfirm']; // 화면 위에서 아래 순서
const TABS = [
  { key: 'login', label: '로그인' },
  { key: 'signup', label: '회원가입' },
];

// 서버 400 코드에서 칸 이름을 찾는다. 코드에 필드 이름이 들어 있다 (API 명세서 0-3: REQUIRED_NAME → name)
function fieldOfCode(code) {
  if (code.includes('LOGIN_ID')) return 'loginId';
  if (code.includes('NAME')) return 'name';
  return 'password';
}

export default function LoginPage() {
  const [tab, setTab] = useState('login'); // 처음 열면 로그인 탭 (화면정의서 ②)
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState({}); // 회원가입 { 칸 이름: code }
  const [loginError, setLoginError] = useState(null); // 로그인 버튼 아래 문구의 code (화면정의서 ⑥⑦)
  const [submitting, setSubmitting] = useState(false);
  const { sessionExpired, signIn } = useAuth();
  const tabRefs = useRef({}); // 화살표 키로 탭을 옮길 때 그 탭에 포커스를 준다
  const focusErrorRef = useRef(false); // 제출로 생긴 오류일 때만 true. 칸을 고쳐 오류가 사라질 때는 커서를 옮기지 않는다

  // 제출 뒤 틀린 칸 중 가장 위의 칸으로 커서를 옮긴다. 화면 읽기 프로그램도 그 칸의 오류 문구를 바로 읽는다
  // 그린 뒤에 옮긴다: 서버 응답(409) 직후에는 아직 fieldset이 잠겨 있어 포커스가 들어가지 않는다
  useEffect(() => {
    if (!focusErrorRef.current || submitting) return;
    focusErrorRef.current = false;
    const first = SIGNUP_ORDER.find((name) => errors[name]);
    if (first) document.getElementById(`field-${first}`)?.focus();
  }, [errors, submitting]);

  // 탭을 바꾸면 입력값·오류 문구를 모두 지운다 (결정 F). 가입 성공 때만 로그인 아이디를 넘겨받는다 (결정 G)
  function switchTab(next, loginId = '') {
    setTab(next);
    setLoginForm({ ...EMPTY_LOGIN, loginId });
    setSignupForm(EMPTY_SIGNUP);
    setErrors({});
    setLoginError(null);
  }

  // 탭 키보드 조작 (WAI-ARIA tabs): ←→로 옆 탭, Home/End로 처음·끝. Tab 키는 탭 묶음을 한 번에 지나간다
  function onTabKeyDown(event) {
    const index = TABS.findIndex((t) => t.key === tab);
    const moves = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: TABS.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = TABS[(moves[event.key] + TABS.length) % TABS.length].key;
    if (next !== tab) switchTab(next);
    tabRefs.current[next]?.focus();
  }

  // 칸을 고치면 그 칸의 오류 문구만 사라진다 (결정 H)
  function changeSignup(event) {
    const { name, value } = event.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // 로그인 문구는 칸 하나가 아니라 둘 다에 대한 것이라, 어느 칸을 고쳐도 사라진다
  function changeLogin(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setLoginError(null);
  }

  async function submitSignup(event) {
    event.preventDefault(); // form 기본 동작(페이지 새로고침)을 막는다. Enter로도 여기로 온다

    const found = validateSignup(signupForm);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusErrorRef.current = true;
      return; // 틀린 칸이 있으면 요청하지 않는다
    }

    setSubmitting(true);
    const { loginId, name, password } = signupForm; // 비밀번호 확인은 보내지 않는다
    const { status, code, data } = await api('/api/auth/signup', {
      method: 'POST',
      body: { loginId, name, password },
    });
    setSubmitting(false);

    if (status === 201) {
      toast.success(messageOf(code)); // 같은 화면에 머물러서 성공을 알려준다 (결정 E-2)
      switchTab('login', data.loginId); // 서버가 소문자로 바꾼 아이디
    } else if (status === 409) {
      setErrors({ loginId: code });
      focusErrorRef.current = true;
    } else if (status === 400) {
      // 화면 검사와 규칙이 같아 정상이면 나오지 않는다. 나오면 코드의 필드 이름으로 그 칸 아래에
      setErrors({ [fieldOfCode(code)]: code });
      focusErrorRef.current = true;
    } else {
      toast.error(messageOf(code)); // 500·네트워크. 입력값은 그대로 둔다
    }
  }

  async function submitLogin(event) {
    event.preventDefault();

    // 빈 칸이면 요청하지 않는다 (⑥). 아이디는 서버처럼 앞뒤 공백을 지우고, 비밀번호는 빈 문자열만 빈 칸으로 본다
    const { loginId, password } = loginForm;
    if (loginId.trim() === '' || password === '') {
      setLoginError('LOGIN_FIELDS_REQUIRED');
      return;
    }

    setSubmitting(true);
    // api()가 credentials: 'include'를 넣어서, 응답의 Set-Cookie(access_token)를 브라우저가 저장한다
    const { status, code, data } = await api('/api/auth/login', {
      method: 'POST',
      body: { loginId, password },
    });
    setSubmitting(false);

    if (status === 200) {
      // 로그인 상태를 바꾸면 GuestOnly가 / 로 보낸다 (replace: 뒤로 가기로 /login에 돌아오지 않음, ⑥)
      // 응답 data가 AUTH-03과 같은 모양이라 /me를 다시 부르지 않는다. 화면이 바뀌는 것으로 충분해 토스트는 없음
      signIn(data);
    } else if (status === 401 || status === 400) {
      // 이 401은 INVALID_LOGIN_ID_OR_PASSWORD라 api.js의 공통 401 처리(code가 UNAUTHORIZED일 때만)에 걸리지 않는다 (⑦)
      setLoginError(code);
    } else {
      toast.error(messageOf(code)); // 500·네트워크. 입력값은 그대로 둔다
    }
  }

  return (
    <div className={styles.page}>
      {/* ① 이미지 영역: 장식. 그림은 마무리 단계 */}
      <div className={styles.visual} aria-hidden="true" />

      <main className={styles.panel}>
        <div className={styles.content}>
          <h1 className={styles.title}>35cheol</h1>

          {/* ③ 만료 안내: 사용 중 401로 들어왔을 때만. 앱 시작 401·로그아웃에는 없음 (SCR-COMMON-01 결정 D) */}
          {sessionExpired && <p className={styles.notice} role="status">{messageOf('SESSION_EXPIRED')}</p>}

          {/* ② 탭 */}
          <div className={styles.tabs} role="tablist" aria-label="로그인 또는 회원가입" onKeyDown={onTabKeyDown}>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                ref={(el) => { tabRefs.current[key] = el; }}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls="auth-panel"
                tabIndex={tab === key ? 0 : -1}
                className={tab === key ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => switchTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 탭이 가리키는 영역. 지금 선택된 탭이 이 영역의 이름이 된다 */}
          <div role="tabpanel" id="auth-panel" aria-labelledby={`tab-${tab}`}>
            {tab === 'login' ? (
              <form onSubmit={submitLogin} aria-busy={submitting}>
                <fieldset className={styles.fields} disabled={submitting}>
                  <Field label="아이디" name="loginId" value={loginForm.loginId} onChange={changeLogin} autoComplete="username" />
                  <Field label="비밀번호" name="password" type="password" value={loginForm.password} onChange={changeLogin} autoComplete="current-password" />
                  <div className={styles.field}>
                    <button type="submit" className={styles.submit}>로그인</button>
                    {/* ⑥⑦ 버튼 아래 문구. 무엇이 틀렸는지 구분하지 않는다 */}
                    {loginError && <p className={styles.error} role="alert">{messageOf(loginError)}</p>}
                  </div>
                </fieldset>
              </form>
            ) : (
              <form onSubmit={submitSignup} aria-busy={submitting}>
                {/* fieldset disabled: 요청 중에는 안의 칸·버튼이 한 번에 잠긴다 */}
                <fieldset className={styles.fields} disabled={submitting}>
                  <Field
                    label="아이디" name="loginId" value={signupForm.loginId} onChange={changeSignup}
                    help="4~20자, 영문·숫자" error={errors.loginId} autoComplete="username"
                  />
                  <Field
                    label="이름" name="name" value={signupForm.name} onChange={changeSignup}
                    error={errors.name} autoComplete="name"
                  />
                  <Field
                    label="비밀번호" name="password" type="password" value={signupForm.password} onChange={changeSignup}
                    help="8~64자, 영문·숫자·특수문자 (공백·한글 불가)" error={errors.password} autoComplete="new-password"
                  />
                  <Field
                    label="비밀번호 확인" name="passwordConfirm" type="password" value={signupForm.passwordConfirm} onChange={changeSignup}
                    error={errors.passwordConfirm} autoComplete="new-password"
                  />
                  <button type="submit" className={styles.submit}>가입하기</button>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// 입력칸 하나: 라벨 → 칸 → 도움말 → 오류 문구 (Figma 04 입력칸, DESIGN.md form-field)
// error는 code로 받아 사전에서 문구를 찾는다
function Field({ label, name, type = 'text', value, onChange, help, error, autoComplete }) {
  const id = `field-${name}`;
  // 도움말과 오류 문구를 둘 다 칸에 연결한다. 칸에 들어가면 화면 읽기 프로그램이 규칙과 오류를 함께 읽는다
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={error ? `${styles.input} ${styles.inputError}` : styles.input}
      />
      {help && <p id={`${id}-help`} className={styles.help}>{help}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{messageOf(error)}</p>}
    </div>
  );
}
