import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { messageOf } from '../messages.js';
import { validateSignup } from '../validate.js';
import styles from './LoginPage.module.css';

// SCR-AUTH-01 로그인(/login, AUTH-02) / 회원가입(/signup, AUTH-01)
// 처음에는 한 화면의 탭이었지만, 대부분은 로그인만 하고 가입은 한 번이라 주소를 나누고 맨 아래 링크로 오간다
// 두 화면은 소개 패널·입력칸 모양이 같아 컴포넌트 하나에 mode로 나눈다 (App.jsx가 key={mode}로 따로 그림)
// 로그인 상태로 들어오면 / 로 보내는 것과 AUTH-03 응답 전에 그리지 않는 것은 App.jsx·auth.jsx(GuestOnly)가 맡는다

const SIGNUP_ORDER = ['loginId', 'name', 'password', 'passwordConfirm']; // 화면 위에서 아래 순서
const INTRO_FEATURES = ['CREATE', 'JOIN', 'NOTICE']; // 소개 패널의 기능 3개 (문구는 messages.js)

// 서버 400 코드에서 칸 이름을 찾는다. 코드에 필드 이름이 들어 있다 (API 명세서 0-3: REQUIRED_NAME → name)
function fieldOfCode(code) {
  if (code.includes('LOGIN_ID')) return 'loginId';
  if (code.includes('NAME')) return 'name';
  return 'password';
}

export default function LoginPage({ mode }) {
  const isLogin = mode === 'login';
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionExpired, signIn } = useAuth();
  // 가입 성공 뒤 /login으로 올 때 navigate state로 아이디를 받는다 (주소창에 남지 않는다)
  const signedUpId = isLogin ? location.state?.loginId ?? '' : '';

  const [form, setForm] = useState(
    isLogin ? { loginId: signedUpId, password: '' } : { loginId: '', name: '', password: '', passwordConfirm: '' },
  );
  const [errors, setErrors] = useState({}); // 회원가입 { 칸 이름: code }
  const [loginError, setLoginError] = useState(null); // 로그인 버튼 아래 문구의 code (화면정의서 ⑥⑦)
  const [submitting, setSubmitting] = useState(false);
  const focusErrorRef = useRef(false); // 제출로 생긴 오류일 때만 true. 칸을 고쳐 오류가 사라질 때는 커서를 옮기지 않는다

  // 처음 그린 뒤 첫 칸에 커서 (B1). 가입하고 왔으면 아이디가 채워져 있으니 비밀번호 칸 (B6)
  useEffect(() => {
    document.getElementById(signedUpId ? 'field-password' : 'field-loginId')?.focus();
  }, [signedUpId]);

  // 제출 뒤 틀린 칸 중 가장 위의 칸으로 커서를 옮긴다. 화면 읽기 프로그램도 그 칸의 오류 문구를 바로 읽는다
  // 그린 뒤에 옮긴다: 서버 응답(409) 직후에는 아직 fieldset이 잠겨 있어 포커스가 들어가지 않는다
  useEffect(() => {
    if (!focusErrorRef.current || submitting) return;
    focusErrorRef.current = false;
    const first = SIGNUP_ORDER.find((name) => errors[name]);
    if (first) document.getElementById(`field-${first}`)?.focus();
  }, [errors, submitting]);

  // 칸을 고치면 회원가입은 그 칸의 오류 문구만 사라진다 (결정 H)
  // 로그인 문구는 칸 하나가 아니라 둘 다에 대한 것이라, 어느 칸을 고쳐도 사라진다
  function change(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (isLogin) setLoginError(null);
    else setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function submitSignup(event) {
    event.preventDefault(); // form 기본 동작(페이지 새로고침)을 막는다. Enter로도 여기로 온다

    const found = validateSignup(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusErrorRef.current = true;
      return; // 틀린 칸이 있으면 요청하지 않는다
    }

    setSubmitting(true);
    const { loginId, name, password } = form; // 비밀번호 확인은 보내지 않는다
    const { status, code, data } = await api('/api/auth/signup', {
      method: 'POST',
      body: { loginId, name, password },
    });
    setSubmitting(false);

    if (status === 201) {
      // 로그인 화면으로 옮겨도 토스트는 남는다 (App.jsx에 하나). 서버가 소문자로 바꾼 아이디를 넘긴다 (결정 G)
      toast.success(messageOf(code));
      navigate('/login', { state: { loginId: data.loginId } });
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
    const { loginId, password } = form;
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
      {/* 폼이 먼저(왼쪽): 이 화면의 주인공. 소개는 처음 온 사람만 읽는다 */}
      <main className={styles.panel}>
        <div className={styles.content}>
          <header className={styles.header}>
            <p className={styles.brand}>35cheol</p>
            <h1 className={styles.title}>{messageOf(isLogin ? 'AUTH_LOGIN_TITLE' : 'AUTH_SIGNUP_TITLE')}</h1>
            <p className={styles.subtitle}>{messageOf(isLogin ? 'AUTH_LOGIN_SUB' : 'AUTH_SIGNUP_SUB')}</p>
          </header>

          {/* ③ 만료 안내: 사용 중 401로 들어왔을 때만. 앱 시작 401·로그아웃에는 없음 (SCR-COMMON-01 결정 D) */}
          {isLogin && sessionExpired && <p className={styles.notice} role="status">{messageOf('SESSION_EXPIRED')}</p>}

          {isLogin ? (
            <form onSubmit={submitLogin} aria-busy={submitting}>
              {/* fieldset disabled: 요청 중에는 안의 칸·버튼이 한 번에 잠긴다 */}
              <fieldset className={styles.fields} disabled={submitting}>
                <Field label="아이디" name="loginId" value={form.loginId} onChange={change} autoComplete="username" />
                <Field
                  label="비밀번호" name="password" type="password" value={form.password} onChange={change}
                  autoComplete="current-password" revealable
                />
                <div className={styles.field}>
                  {/* 요청 중에는 문구로도 알린다 (흐려지기만 하면 눌렸는지 알기 어렵다) */}
                  <button type="submit" className={styles.submit}>
                    {messageOf(submitting ? 'BUTTON_LOGGING_IN' : 'BUTTON_LOGIN')}
                  </button>
                  {/* ⑥⑦ 버튼 아래 문구. 무엇이 틀렸는지 구분하지 않는다 */}
                  {loginError && <p className={styles.error} role="alert">{messageOf(loginError)}</p>}
                </div>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={submitSignup} aria-busy={submitting}>
              <fieldset className={styles.fields} disabled={submitting}>
                <Field
                  label="아이디" name="loginId" value={form.loginId} onChange={change}
                  help="4~20자, 영문·숫자" error={errors.loginId} autoComplete="username"
                />
                <Field label="이름" name="name" value={form.name} onChange={change} error={errors.name} autoComplete="name" />
                <Field
                  label="비밀번호" name="password" type="password" value={form.password} onChange={change}
                  help="8~64자, 영문·숫자·특수문자 (공백·한글 불가)" error={errors.password} autoComplete="new-password" revealable
                />
                <Field
                  label="비밀번호 확인" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={change}
                  error={errors.passwordConfirm} autoComplete="new-password" revealable
                />
                <button type="submit" className={styles.submit}>
                  {messageOf(submitting ? 'BUTTON_SIGNING_UP' : 'BUTTON_SIGNUP')}
                </button>
              </fieldset>
            </form>
          )}

          {/* 다른 화면으로: 로그인 ↔ 회원가입 */}
          <p className={styles.switch}>
            {messageOf(isLogin ? 'AUTH_NO_ACCOUNT' : 'AUTH_HAS_ACCOUNT')}{' '}
            <Link to={isLogin ? '/signup' : '/login'} className={styles.switchLink}>
              {messageOf(isLogin ? 'LINK_SIGNUP' : 'LINK_LOGIN')}
            </Link>
          </p>
        </div>
      </main>

      {/* ① 서비스 소개: 처음 온 사람에게 이 서비스가 무엇인지. 그림은 마무리 단계 */}
      <aside className={styles.visual} aria-label="서비스 소개">
        <div className={styles.intro}>
          <p className={styles.introHeadline}>{messageOf('INTRO_HEADLINE')}</p>
          <p className={styles.introLead}>{messageOf('INTRO_LEAD')}</p>
          <ul className={styles.features}>
            {INTRO_FEATURES.map((key) => (
              <li key={key} className={styles.feature}>
                <span className={styles.featureTitle}>{messageOf(`INTRO_${key}_TITLE`)}</span>
                <span className={styles.featureDesc}>{messageOf(`INTRO_${key}_DESC`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

// 입력칸 하나: 라벨 → 칸 → 도움말 → 오류 문구 (Figma 04 입력칸, DESIGN.md form-field)
// error는 code로 받아 사전에서 문구를 찾는다
// revealable: 비밀번호 칸 오른쪽에 [보기]/[숨기기] (B3). 칸마다 따로 켜고, 화면을 옮기면 새로 그려져 다시 숨김
function Field({ label, name, type = 'text', value, onChange, help, error, autoComplete, revealable = false }) {
  const [revealed, setRevealed] = useState(false);
  const id = `field-${name}`;
  // 도움말과 오류 문구를 둘 다 칸에 연결한다. 칸에 들어가면 화면 읽기 프로그램이 규칙과 오류를 함께 읽는다
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          name={name}
          type={revealable && revealed ? 'text' : type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[styles.input, error && styles.inputError, revealable && styles.inputRevealable].filter(Boolean).join(' ')}
        />
        {revealable && (
          // 보이는 글자(보기/숨기기)가 바뀌므로 읽히는 이름도 같이 바꾼다. '비밀번호 확인 보기'처럼 어느 칸인지 함께 읽힌다
          <button
            type="button"
            className={styles.reveal}
            aria-label={`${label} ${messageOf(revealed ? 'PASSWORD_HIDE' : 'PASSWORD_SHOW')}`}
            onClick={() => setRevealed((on) => !on)}
          >
            {messageOf(revealed ? 'PASSWORD_HIDE' : 'PASSWORD_SHOW')}
          </button>
        )}
      </div>
      {help && <p id={`${id}-help`} className={styles.help}>{help}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{messageOf(error)}</p>}
    </div>
  );
}
