import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import styles from '../components/Modal.module.css';
import { messageOf } from '../messages.js';
import { validateString } from '../validate.js';

// SCR-ORG-02 동아리 만들기 모달 (ORG-01). 메인 위에 뜬다 (URL 없음)
// 성공하면 onCreated(orgId): 메인이 모달을 닫고 → 목록을 다시 불러오고 → 새 동아리 홈으로 이동한다
export default function CreateOrgModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null); // 칸 아래 문구의 code
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  // 요청 중에는 칸이 잠겨(disabled) 커서가 빠진다. 실패로 잠금이 풀리면 칸에 커서를 돌려줘 바로 고치거나 다시 누를 수 있게
  useEffect(() => {
    if (!submitting) inputRef.current?.focus();
  }, [submitting]);

  // 그 칸을 고치면 오류가 사라진다 (화면정의서 결정 H)
  function change(event) {
    setName(event.target.value);
    setError(null);
  }

  // ③ 만들기·Enter → 검사 → 요청
  async function submit(event) {
    event.preventDefault(); // form의 기본 동작(페이지 새로고침)을 막는다
    if (submitting) return;

    // 화면 검사: 서버와 같은 규칙(앞뒤 공백 제거 후 1~30자, 글자 수는 코드 포인트)·같은 코드
    const checked = validateString(name, { field: 'ORG_NAME', min: 1, max: 30 });
    if (checked.code) {
      setError(checked.code);
      return; // 요청을 보내지 않는다
    }

    setSubmitting(true); // 요청 중 잠금: 버튼 두 번 클릭으로 동아리가 두 개 생기지 않게 (이름 중복 허용이라 서버가 못 막음)
    const { status, code, data } = await api('/api/orgs', { method: 'POST', body: { name: checked.value } });

    if (status === 201) {
      onCreated(data.orgId); // 토스트 없음: 새 동아리 화면이 결과 (결정 I)
      return; // 모달이 닫히며 사라지므로 잠금을 풀지 않는다
    }
    setSubmitting(false);
    if (status === 400) setError(code); // 화면 검사와 같은 규칙이라 보통 나오지 않음
    else if (status !== 401) toast.error(messageOf(code), { id: messageOf(code) }); // 500·네트워크: 토스트, 모달과 입력값은 그대로 (서버가 롤백했으니 다시 눌러도 중복 없음)
    // 401은 api.js 공통 처리 → 로그인 화면 (레이아웃째 사라진다)
  }

  const describedBy = error ? 'org-name-help org-name-error' : 'org-name-help';

  return (
    <Modal title={messageOf('MODAL_CREATE_ORG_TITLE')} onClose={onClose} closable={!submitting}>
      {/* noValidate: 브라우저 기본 검사 말풍선 대신 우리 문구를 칸 아래에 */}
      <form onSubmit={submit} noValidate aria-busy={submitting}>
        <div className={styles.field}>
          <label htmlFor="org-name" className={styles.label}>{messageOf('LABEL_ORG_NAME')}</label>
          <input
            id="org-name"
            ref={inputRef}
            value={name}
            onChange={change}
            disabled={submitting}
            placeholder={messageOf('PLACEHOLDER_ORG_NAME')}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={error ? `${styles.input} ${styles.inputError}` : styles.input}
          />
          <p id="org-name-help" className={styles.help}>{messageOf('HELP_ORG_NAME')}</p>
          {/* role="alert": 문구가 나타나면 화면 읽기 프로그램이 바로 읽는다 */}
          {error && <p id="org-name-error" className={styles.error} role="alert">{messageOf(error)}</p>}
        </div>
        <div className={styles.actions}>
          {/* ② 취소: 닫고 입력값을 버린다. 요청 중에는 잠금 */}
          <button type="button" className={styles.secondary} onClick={onClose} disabled={submitting}>
            {messageOf('BUTTON_CANCEL')}
          </button>
          <button type="submit" className={styles.primary} disabled={submitting}>
            {messageOf(submitting ? 'BUTTON_CREATING' : 'BUTTON_CREATE')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
