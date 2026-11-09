import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useOutletContext } from 'react-router';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import modalStyles from '../components/Modal.module.css';
import { messageOf } from '../messages.js';
import { ArrowIcon, HomeBox, useBoxData } from './HomeBox.jsx';
import styles from './OrgHomePage.module.css';

// SCR-ORG-03 ⑤ 가입 관리 박스 (회장·운영진만): ⑥ 초대 코드 + 복사, ⑦ 발급·재발급, ⑧ 대기 신청 건수
// 이 컴포넌트는 OrgHomePage가 회장·운영진일 때만 그린다 → 일반 회원은 JOIN-01·03 요청 자체가 없다 (호출 생략)
export default function JoinBox() {
  const { orgId } = useOutletContext();
  // 두 API를 함께 부르고 하나라도 실패하면 박스 전체를 오류로 (결정 5). [다시 시도]는 둘 다 다시
  // Promise.all: 두 요청을 동시에 보내고 둘 다 끝날 때까지 기다린다 (차례로 보내는 것보다 빠름)
  const { status, data, retry, setData } = useBoxData(async () => {
    const [code, requests] = await Promise.all([
      api(`/api/orgs/${orgId}/invite-code`),
      api(`/api/orgs/${orgId}/join-requests`),
    ]);
    if (code.status !== 200 || requests.status !== 200) return null;
    // 대기 건수는 목록의 개수 (건수 전용 API 없음, 명세 JOIN-03)
    return { inviteCode: code.data.inviteCode, pendingCount: requests.data.joinRequests.length };
  });

  const [issuing, setIssuing] = useState(false); // 발급·재발급 요청 중: 버튼 잠금 (두 번 누르기 방지)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const copyButtonRef = useRef(null);
  const focusCopyRef = useRef(false); // 첫 발급 뒤 [코드 발급] 버튼이 사라지므로 커서를 [복사]로 옮긴다

  useEffect(() => {
    if (!focusCopyRef.current || !data?.inviteCode) return;
    focusCopyRef.current = false;
    copyButtonRef.current?.focus();
  }, [data?.inviteCode]);

  // ⑦ JOIN-01 발급 (첫 발급·재발급 같은 API). 201 → 새 코드로 바꿔 보여주고 토스트 (같은 화면에 머무는 결과, 결정 I)
  // 실패(500·네트워크)는 토스트, 기존 코드 그대로 (화면정의서). 확인창은 연 채로 둬서 다시 누르거나 취소할 수 있게 (F3 모달과 같음)
  async function issue({ first = false } = {}) {
    setIssuing(true);
    const { status: resStatus, code, data: res } = await api(`/api/orgs/${orgId}/invite-code`, { method: 'POST' });
    setIssuing(false);
    if (resStatus === 201) {
      focusCopyRef.current = first;
      setData((prev) => ({ ...prev, inviteCode: res.inviteCode }));
      setConfirmOpen(false);
      toast.success(messageOf('INVITE_CODE_CREATED'));
    } else if (resStatus !== 401) {
      toast.error(messageOf(code));
    }
  }

  // ⑥ 복사: 클립보드 API (브라우저 기본 기능). https나 localhost에서만 있고, 권한이 거부되면 실패한다
  // 실패하면 토스트로 알리고 코드를 직접 고르게 한다 (코드 글자는 한 번 누르면 전체 선택, user-select: all)
  async function copy() {
    try {
      await navigator.clipboard.writeText(data.inviteCode);
      toast.success(messageOf('INVITE_CODE_COPIED'));
    } catch {
      // navigator.clipboard가 없을 때(TypeError)와 권한 거부(NotAllowedError)를 함께 받는다
      toast.error(messageOf('INVITE_CODE_COPY_FAILED'));
    }
  }

  return (
    <HomeBox title={messageOf('BOX_JOIN')} status={status} onRetry={retry}>
      <p className={styles.label}>{messageOf('LABEL_INVITE_CODE')}</p>
      {data?.inviteCode ? (
        <div className={styles.codeRow}>
          <span className={styles.code}>{data.inviteCode}</span>
          <button type="button" ref={copyButtonRef} className={styles.utility} onClick={copy}>
            {messageOf('BUTTON_COPY')}
          </button>
          {/* 재발급은 지금 코드를 잃으므로 확인창 (결정: 잃는 것이 있을 때만) */}
          <button
            type="button"
            className={styles.utility}
            onClick={() => setConfirmOpen(true)}
            disabled={issuing}
            aria-haspopup="dialog"
          >
            {messageOf('BUTTON_REISSUE')}
          </button>
        </div>
      ) : (
        // 코드가 null(아직 발급 안 함): 문구 + [코드 발급]만. 잃는 것이 없어 확인창 없이 바로
        <div className={styles.codeRow}>
          <span className={styles.note}>{messageOf('INVITE_CODE_EMPTY')}</span>
          <button type="button" className={styles.utility} onClick={() => issue({ first: true })} disabled={issuing}>
            {messageOf(issuing ? 'BUTTON_ISSUING' : 'BUTTON_ISSUE')}
          </button>
        </div>
      )}

      {/* ⑧ 대기 신청 n건 → 가입 신청 목록 (F7). 0건이어도 누를 수 있다 */}
      <Link to={`/orgs/${orgId}/join-requests`} className={styles.footerLink}>
        <span>
          {data?.pendingCount
            ? messageOf('JOIN_REQUESTS_COUNT').replace('{n}', data.pendingCount)
            : messageOf('JOIN_REQUESTS_EMPTY')}
        </span>
        <ArrowIcon />
      </Link>

      {/* 재발급 확인창: F3의 Modal 부품을 칸 없이 쓴다. 열리면 첫 버튼 [취소]에 커서 (잃는 쪽이 기본이 되지 않게) */}
      {confirmOpen && (
        <Modal title={messageOf('MODAL_REISSUE_TITLE')} onClose={() => setConfirmOpen(false)} closable={!issuing}>
          <p className={styles.confirmDesc}>{messageOf('MODAL_REISSUE_DESC')}</p>
          <div className={modalStyles.actions}>
            <button type="button" className={modalStyles.secondary} onClick={() => setConfirmOpen(false)} disabled={issuing}>
              {messageOf('BUTTON_CANCEL')}
            </button>
            <button type="button" className={modalStyles.primary} onClick={() => issue()} disabled={issuing}>
              {messageOf(issuing ? 'BUTTON_REISSUING' : 'BUTTON_REISSUE')}
            </button>
          </div>
        </Modal>
      )}
    </HomeBox>
  );
}
