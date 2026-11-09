import { useEffect, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useOutletContext } from 'react-router';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import modalStyles from '../components/Modal.module.css';
import PageTitle from '../components/PageTitle.jsx';
import StatusPanel from '../components/StatusPanel.jsx';
import { messageOf } from '../messages.js';
import { validateNotice } from '../validate.js';
import styles from './NoticeFormPage.module.css';

const EMPTY = { title: '', content: '' };

// SCR-NOTICE-03 공지 작성 (/orgs/:orgId/notices/new). 회장·운영진만
export default function NoticeFormPage() {
  const { orgId, myRole } = useOutletContext();

  // 일반 회원이 주소로 직접 들어오면 폼 대신 권한 없음 패널 (화면정의서 상태표)
  // 화면 편의일 뿐이다: 개발자 도구로 요청을 보내도 NOTICE-03의 역할 검사가 403으로 막는다
  if (myRole !== 'OWNER' && myRole !== 'ADMIN') {
    return <StatusPanel kind="forbidden" orgId={orgId} titleAs="h1" />;
  }

  return (
    <section>
      {/* ① 오른쪽 행동 버튼 없음 (저장·취소는 폼 아래) */}
      <PageTitle title={messageOf('NOTICE_FORM_NEW_TITLE')} />
      <NoticeForm orgId={orgId} initial={EMPTY} />
    </section>
  );
}

// 작성·수정이 함께 쓸 폼. initial(처음 값)은 그릴 때 한 번만 state의 시작값이 된다
// 제어 컴포넌트: 칸의 값을 state가 쥐고(value), 바뀔 때마다 onChange로 state를 고친다 → 화면 = state
function NoticeForm({ orgId, initial }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [errors, setErrors] = useState({}); // { title?: 코드, content?: 코드 }
  const [submitting, setSubmitting] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const id = useId(); // 칸·문구 id (라벨·aria-describedby 연결)

  const listPath = `/orgs/${orgId}/notices`;

  // ② 열리면 제목 칸에 커서
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // 입력이 있는지: 처음 값과 다르면 (작성은 빈 값과 비교). 계산할 수 있는 값이라 state로 두지 않는다
  const dirty = title !== initial.title || content !== initial.content;
  // ④ 글자 수: 서버와 같은 기준(코드 포인트). 입력한 그대로 센다 (앞뒤 공백 제거는 저장할 때)
  const count = [...content].length;

  function changeTitle(event) {
    setTitle(event.target.value);
    setErrors((prev) => ({ ...prev, title: undefined })); // 그 칸을 고치면 그 칸 오류만 사라진다 (결정 H)
  }

  function changeContent(event) {
    setContent(event.target.value);
    setErrors((prev) => ({ ...prev, content: undefined }));
  }

  // 오류 칸 중 첫 칸에 커서: 어디를 고쳐야 하는지 바로 보이게
  function focusFirstError(found) {
    (found.title ? titleRef : contentRef).current?.focus();
  }

  // ⑥ 올리기 → 전체 검사 → 요청
  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const { errors: found, value } = validateNotice({ title, content });
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(found);
      return; // 요청을 보내지 않는다
    }

    setSubmitting(true); // 요청 중 잠금: 두 번 눌러 공지가 두 개 생기지 않게 (막아줄 UNIQUE 없음)
    const { status, code, data } = await api(`/api/orgs/${encodeURIComponent(orgId)}/notices`, {
      method: 'POST',
      body: value, // 앞뒤 공백을 지운 값
    });

    if (status === 201) {
      // 새 공지 상세로. replace: 뒤로 가기로 다 쓴 폼에 돌아오지 않게. 토스트 없음 (새 화면이 결과, 결정 I)
      navigate(`/orgs/${orgId}/notices/${data.noticeId}`, { replace: true });
      return;
    }

    setSubmitting(false);
    if (status === 401) return; // 공통 처리 → /login (쓰던 내용은 사라짐: Refresh Token 단계에서 해결)
    if (status === 400 && (code.includes('TITLE') || code.includes('CONTENT'))) {
      // 화면 검사와 같은 규칙이라 보통 나오지 않는다
      const found = code.includes('TITLE') ? { title: code } : { content: code };
      setErrors(found);
      focusFirstError(found);
      return;
    }
    // 403(그사이 역할이 바뀜)·500·네트워크: 토스트, 입력값 그대로 (다시 누를 수 있게)
    toast.error(messageOf(code));
  }

  // ⑤ 취소: 입력이 있으면 확인창(결정 S), 없으면 바로 나간다
  function cancel() {
    if (dirty) setLeaveOpen(true);
    else leave();
  }

  // 나가기도 replace: 뒤로 가기로 버린 폼에 돌아오지 않게
  function leave() {
    navigate(listPath, { replace: true });
  }

  const titleDescribedBy = errors.title ? `${id}-title-error` : undefined;
  const contentDescribedBy = errors.content ? `${id}-count ${id}-content-error` : `${id}-count`;

  return (
    // noValidate: 브라우저 기본 검사 말풍선 대신 우리 문구를 칸 아래에
    <form onSubmit={submit} noValidate aria-busy={submitting} className={styles.form}>
      <div className={modalStyles.field}>
        <label htmlFor={`${id}-title`} className={modalStyles.label}>{messageOf('LABEL_NOTICE_TITLE')}</label>
        <input
          id={`${id}-title`}
          ref={titleRef}
          value={title}
          onChange={changeTitle}
          disabled={submitting}
          placeholder={messageOf('PLACEHOLDER_NOTICE_TITLE')}
          autoComplete="off"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={titleDescribedBy}
          className={errors.title ? `${modalStyles.input} ${modalStyles.inputError}` : modalStyles.input}
        />
        {errors.title && (
          <p id={`${id}-title-error`} className={modalStyles.error} role="alert">{messageOf(errors.title)}</p>
        )}
      </div>

      <div className={modalStyles.field}>
        <label htmlFor={`${id}-content`} className={modalStyles.label}>{messageOf('LABEL_NOTICE_CONTENT')}</label>
        <textarea
          id={`${id}-content`}
          ref={contentRef}
          value={content}
          onChange={changeContent}
          disabled={submitting}
          aria-invalid={errors.content ? true : undefined}
          aria-describedby={contentDescribedBy}
          className={errors.content ? `${styles.textarea} ${modalStyles.inputError}` : styles.textarea}
        />
        {/* ④ 글자 수. 5,000을 넘으면 빨간색 (저장은 검사에서 막힌다) */}
        <p id={`${id}-count`} className={count > 5000 ? `${styles.count} ${styles.countOver}` : styles.count}>
          {messageOf('NOTICE_CONTENT_COUNT').replace('{n}', count.toLocaleString('ko-KR'))}
        </p>
        {errors.content && (
          <p id={`${id}-content-error`} className={modalStyles.error} role="alert">{messageOf(errors.content)}</p>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={modalStyles.secondary} onClick={cancel} disabled={submitting}>
          {messageOf('BUTTON_CANCEL')}
        </button>
        <button type="submit" className={modalStyles.primary} disabled={submitting}>
          {messageOf(submitting ? 'BUTTON_POSTING' : 'BUTTON_POST')}
        </button>
      </div>

      {/* 나가기 확인창: Modal을 칸 없이. 커서는 [계속 쓰기] (잃는 쪽이 기본이 되지 않게), [나가기]는 입력을 버리므로 Danger */}
      {leaveOpen && (
        <Modal title={messageOf('MODAL_LEAVE_TITLE')} onClose={() => setLeaveOpen(false)}>
          <div className={modalStyles.actions}>
            <button type="button" className={modalStyles.secondary} onClick={() => setLeaveOpen(false)}>
              {messageOf('BUTTON_KEEP_WRITING')}
            </button>
            <button type="button" className={modalStyles.danger} onClick={leave}>
              {messageOf('BUTTON_LEAVE')}
            </button>
          </div>
        </Modal>
      )}
    </form>
  );
}
