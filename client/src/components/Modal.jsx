import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

// 모달 껍데기 (DESIGN.md modal). 동아리 만들기(SCR-ORG-02)·가입하기(SCR-JOIN-01)가 함께 쓴다
// 여는 쪽이 {open && <Modal …>}처럼 조건부로 그린다 → 닫으면 안의 state(입력값)가 함께 사라진다 (화면정의서: 취소하면 입력값을 버림)
//
// title     제목. aria-labelledby로 dialog의 이름이 된다
// onClose   취소·Esc·바깥 누르기
// closable  false면 Esc·바깥으로 닫히지 않는다 (요청 중, 화면정의서 ④)
export default function Modal({ title, onClose, closable = true, children }) {
  const titleId = useId(); // 화면에 모달이 둘 떠도 겹치지 않는 id
  const dialogRef = useRef(null);
  // Esc 처리 함수가 늘 최신 값을 보게 ref에 둔다 (effect를 다시 달지 않아도 되게)
  const closeRef = useRef({ onClose, closable });
  closeRef.current = { onClose, closable };

  // 열릴 때 한 번: 뒤 화면 잠그기 → 첫 칸에 커서 / 닫힐 때(정리 함수): 거꾸로 풀고 연 버튼에 커서 돌려주기
  useEffect(() => {
    const opener = document.activeElement; // 모달을 연 버튼 (카드)
    const shell = document.getElementById('app-shell');
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;

    // inert: 뒤 화면 전체를 '없는 것'처럼 만든다. Tab·클릭·화면 읽기 프로그램이 들어가지 않음 = 커서 가두기
    shell?.setAttribute('inert', '');
    // 뒤 화면 스크롤 막기. html에 scrollbar-gutter: stable이 있어 스크롤바가 사라져도 화면이 옆으로 밀리지 않는다
    html.style.overflow = 'hidden';
    // 열리면 첫 입력칸에 커서 (화면정의서 ①). 칸이 없으면 첫 버튼
    dialogRef.current.querySelector('input, textarea, button')?.focus();

    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      const { onClose: close, closable: canClose } = closeRef.current;
      if (canClose) close();
    }
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      html.style.overflow = prevOverflow;
      shell?.removeAttribute('inert'); // inert를 먼저 풀어야 그 안의 버튼에 커서를 줄 수 있다
      // 연 버튼이 아직 화면에 있으면 돌려준다 (만들기 성공으로 다른 화면에 가면 없으니 건너뜀)
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  // 바깥(어두운 배경)을 누르면 닫기. mousedown으로 본다: 칸 안에서 글자를 드래그하다 바깥에서 놓았을 때 닫히지 않게
  function closeOnBackdrop(event) {
    if (event.target === event.currentTarget && closable) onClose();
  }

  // createPortal: 모달을 body 바로 아래에 그린다. 뒤 화면(#app-shell)에 inert를 걸어도 모달은 그 밖이라 영향받지 않는다
  return createPortal(
    <div className={styles.backdrop} onMouseDown={closeOnBackdrop}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.title}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
