import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import styles from '../components/Modal.module.css';
import { messageOf } from '../messages.js';
import { validateString } from '../validate.js';

// SCR-JOIN-01 동아리 가입하기 모달 (JOIN-02). 메인 위에 뜬다 (URL 없음)
// 성공하면 onJoined(): 메인이 모달을 닫고 → 목록을 다시 불러오고 → 성공 토스트 ('대기중' 카드가 맨 뒤에 붙는다)
export default function JoinOrgModal({ onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null); // 칸 아래 문구의 code
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  // 요청 중에는 칸이 잠겨 커서가 빠진다. 실패로 잠금이 풀리면 칸에 커서를 돌려준다 (만들기 모달과 같음)
  useEffect(() => {
    if (!submitting) inputRef.current?.focus();
  }, [submitting]);

  // 그 칸을 고치면 오류가 사라진다 (화면정의서 결정 H)
  function change(event) {
    setCode(event.target.value);
    setError(null);
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    // ① 화면에서는 빈 값만 막는다. 형식(8자리 등)은 검사하지 않고 서버의 404에 맡긴다 (명세 JOIN-02: 필수·타입만)
    const checked = validateString(code, { field: 'INVITE_CODE' });
    if (checked.code) {
      setError(checked.code);
      return;
    }

    setSubmitting(true); // 요청 중 잠금. 두 번 눌러도 서버가 두 번째를 409로 막지만, 첫 응답 전에 문구가 바뀌지 않게
    // 앞뒤 공백 제거(validateString) + 대문자. 서버도 같은 정리를 하지만, 보낸 값이 화면에 보인 값과 같게
    const { status, code: resultCode } = await api('/api/join-requests', {
      method: 'POST',
      body: { inviteCode: checked.value.toUpperCase() },
    });

    if (status === 201) {
      onJoined();
      return;
    }
    setSubmitting(false);
    // 400(빈 값)·404(없는 코드·재발급으로 무효)·409(이미 대기중·이미 회원): 고쳐야 하는 오류라 칸 아래 (결정 K)
    if (status === 400 || status === 404 || status === 409) setError(resultCode);
    else if (status !== 401) toast.error(messageOf(resultCode)); // 500·네트워크: 토스트, 모달과 입력값 유지
  }

  const describedBy = error ? 'invite-code-help invite-code-error' : 'invite-code-help';

  return (
    <Modal title={messageOf('MODAL_JOIN_ORG_TITLE')} onClose={onClose} closable={!submitting}>
      <form onSubmit={submit} noValidate aria-busy={submitting}>
        <div className={styles.field}>
          <label htmlFor="invite-code" className={styles.label}>{messageOf('LABEL_INVITE_CODE')}</label>
          <input
            id="invite-code"
            ref={inputRef}
            value={code}
            onChange={change}
            disabled={submitting}
            placeholder={messageOf('PLACEHOLDER_INVITE_CODE')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            // 입력하는 대로 대문자로 보여준다 (화면정의서 ①). 값 자체는 보낼 때 바꾼다: 입력 중에 값을 바꾸면 중간을 고칠 때 커서가 끝으로 튄다
            className={error ? `${styles.input} ${styles.inputCode} ${styles.inputError}` : `${styles.input} ${styles.inputCode}`}
          />
          <p id="invite-code-help" className={styles.help}>{messageOf('HELP_INVITE_CODE')}</p>
          {error && <p id="invite-code-error" className={styles.error} role="alert">{messageOf(error)}</p>}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={submitting}>
            {messageOf('BUTTON_CANCEL')}
          </button>
          <button type="submit" className={styles.primary} disabled={submitting}>
            {messageOf(submitting ? 'BUTTON_JOINING' : 'BUTTON_JOIN')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
