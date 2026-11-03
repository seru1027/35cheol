import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { messageOf } from '../messages.js';
import { validateSignup } from '../validate.js';
import styles from './LoginPage.module.css';

// SCR-AUTH-01 로그인 / 회원가입 (한 화면, 탭 전환. URL은 /login 그대로)
// F1-1: 회원가입(AUTH-01). 로그인 요청은 F1-2

const EMPTY_LOGIN = { loginId: '', password: '' };
const EMPTY_SIGNUP = { loginId: '', name: '', password: '', passwordConfirm: '' };

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
  const [errors, setErrors] = useState({}); // { 칸 이름: code }
  const [submitting, setSubmitting] = useState(false);

  // 탭을 바꾸면 입력값·오류 문구를 모두 지운다 (결정 F). 가입 성공 때만 로그인 아이디를 넘겨받는다 (결정 G)
  function switchTab(next, loginId = '') {
    setTab(next);
    setLoginForm({ ...EMPTY_LOGIN, loginId });
    setSignupForm(EMPTY_SIGNUP);
    setErrors({});
  }

  // 칸을 고치면 그 칸의 오류 문구만 사라진다 (결정 H)
  function changeSignup(event) {
    const { name, value } = event.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function changeLogin(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitSignup(event) {
    event.preventDefault(); // form 기본 동작(페이지 새로고침)을 막는다. Enter로도 여기로 온다

    const found = validateSignup(signupForm);
    if (Object.keys(found).length > 0) {
      setErrors(found);
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
    } else if (status === 400) {
      // 화면 검사와 규칙이 같아 정상이면 나오지 않는다. 나오면 코드의 필드 이름으로 그 칸 아래에
      setErrors({ [fieldOfCode(code)]: code });
    } else {
      toast.error(messageOf(code)); // 500·네트워크. 입력값은 그대로 둔다
    }
  }

  function submitLogin(event) {
    event.preventDefault();
    // F1-2: AUTH-02 로그인 요청
  }

  return (
    <div className={styles.page}>
      {/* ① 이미지 영역: 장식. 그림은 마무리 단계 */}
      <div className={styles.visual} aria-hidden="true" />

      <main className={styles.panel}>
        <div className={styles.content}>
          <h1 className={styles.title}>35cheol</h1>

          {/* ② 탭 */}
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              className={tab === 'login' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => switchTab('login')}
            >
              로그인
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'signup'}
              className={tab === 'signup' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => switchTab('signup')}
            >
              회원가입
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={submitLogin}>
              <fieldset className={styles.fields}>
                <Field label="아이디" name="loginId" value={loginForm.loginId} onChange={changeLogin} autoComplete="username" />
                <Field label="비밀번호" name="password" type="password" value={loginForm.password} onChange={changeLogin} autoComplete="current-password" />
                <button type="submit" className={styles.submit}>로그인</button>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={submitSignup}>
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
      </main>
    </div>
  );
}

// 입력칸 하나: 라벨 → 칸 → 도움말 → 오류 문구 (Figma 04 입력칸, DESIGN.md form-field)
// error는 code로 받아 사전에서 문구를 찾는다
function Field({ label, name, type = 'text', value, onChange, help, error, autoComplete }) {
  const id = `field-${name}`;
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
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? `${styles.input} ${styles.inputError}` : styles.input}
      />
      {help && <p className={styles.help}>{help}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{messageOf(error)}</p>}
    </div>
  );
}
