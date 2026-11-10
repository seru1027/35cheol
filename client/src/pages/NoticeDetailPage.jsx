import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { api } from '../api.js';
import BackLink from '../components/BackLink.jsx';
import Modal from '../components/Modal.jsx';
import modalStyles from '../components/Modal.module.css';
import PageTitle from '../components/PageTitle.jsx';
import StatusPanel from '../components/StatusPanel.jsx';
import { formatDateTime } from '../format.js';
import { messageOf } from '../messages.js';
import styles from './NoticeDetailPage.module.css';

// SCR-NOTICE-02 공지 상세 (/orgs/:orgId/notices/:noticeId). NOTICE-02 조회 + 회장·운영진만 NOTICE-05 삭제
export default function NoticeDetailPage() {
  const { orgId, myRole } = useOutletContext();
  // URL의 두 번째 ID. 문자열 그대로 서버에 보내고, 숫자인지는 서버가 검사한다 (아니면 400 INVALID_NOTICE_ID)
  const { noticeId } = useParams();
  const navigate = useNavigate();
  // [수정][삭제]는 화면 표시용 판단. 실제로 막는 것은 NOTICE-04·05의 역할 검사(403)
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  // NOTICE-02 결과. 어느 공지의 결과인지(noticeId)를 함께 저장한다 (OrgLayout과 같은 이유)
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    api(`/api/orgs/${encodeURIComponent(orgId)}/notices/${encodeURIComponent(noticeId)}`).then(({ status, data }) => {
      if (!ignore) setResult({ noticeId, status, notice: data });
    });
    return () => {
      ignore = true;
    };
  }, [orgId, noticeId, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  const listPath = `/orgs/${orgId}/notices`;

  // ⑦ NOTICE-05 삭제. 성공·404 모두 '이 공지는 이제 없다'는 같은 결과라 목록으로 간다
  // replace: 지금 기록(상세)을 목록으로 바꿔 둔다. 뒤로 가기로 지워진 공지 주소에 돌아오지 않게
  async function remove() {
    setDeleting(true);
    const { status, code } = await api(
      `/api/orgs/${encodeURIComponent(orgId)}/notices/${encodeURIComponent(noticeId)}`,
      { method: 'DELETE' },
    );
    if (status === 200 || status === 404) {
      navigate(listPath, { replace: true });
      // 결과가 사라지는 경우라 토스트로 알린다 (결정 I). 토스트는 라우트 밖에 있어 화면을 옮겨도 남는다
      if (status === 200) toast.success(messageOf('NOTICE_DELETED'));
      else toast(messageOf('NOTICE_ALREADY_DELETED'));
      return; // 화면이 바뀌므로 잠금을 풀지 않는다
    }
    setDeleting(false);
    if (status === 401) return; // 공통 처리 → /login
    // 403(그사이 역할이 바뀜)·500·네트워크: 확인창을 닫고 토스트, 공지는 그대로 (화면정의서 ⑦)
    setConfirmOpen(false);
    toast.error(messageOf(code), { id: messageOf(code) });
  }

  const loaded = result && result.noticeId === noticeId ? result : null;

  // 404 NOTICE_NOT_FOUND(없는 공지·남의 조직 공지)·400 INVALID_NOTICE_ID(/notices/abc): 화면 자체가 없으므로 패널만
  // 이유를 나누지 않는다: 남의 조직 공지 ID라도 '있다'는 사실을 알려주지 않는다 (IDOR, MVP 완료 기준)
  if (loaded && (loaded.status === 404 || loaded.status === 400)) {
    return <StatusPanel kind="notFound" titleAs="h1" />;
  }
  // 403은 보통 OrgLayout이 먼저 막는다. 그사이 대기 상태가 된 경우만
  if (loaded?.status === 403) return <StatusPanel kind="pending" titleAs="h1" />;

  const notice = loaded?.status === 200 ? loaded.notice : null;

  return (
    <section>
      <BackLink to={listPath} label={messageOf('BACK_TO_NOTICES')} />
      <PageTitle
        title={messageOf('NOTICE_LIST_TITLE')}
        actions={
          // 내용이 있을 때만: 불러오는 중·실패에는 고칠 대상이 없다
          canManage && notice && (
            <>
              <Link to={`/orgs/${orgId}/notices/${noticeId}/edit`} className={styles.edit}>
                {messageOf('BUTTON_EDIT')}
              </Link>
              <button type="button" className={styles.delete} onClick={() => setConfirmOpen(true)} aria-haspopup="dialog">
                {messageOf('BUTTON_DELETE')}
              </button>
            </>
          )
        }
      />

      {!loaded || loaded.status === 401 ? (
        <StatusPanel kind="loading" />
      ) : !notice ? (
        <StatusPanel kind="error" onRetry={retry} />
      ) : (
        <article className={styles.box}>
          <h2 className={styles.title}>{notice.title}</h2>
          {/* ⑤ 작성자 · 작성 시각, 수정된 적이 있을 때만(updatedAt이 null이 아님) '· 수정됨 시각' */}
          <p className={styles.meta}>
            {notice.authorName} · <time dateTime={notice.createdAt}>{formatDateTime(notice.createdAt)}</time>
            {notice.updatedAt && (
              <>
                {' · '}{messageOf('NOTICE_EDITED')} <time dateTime={notice.updatedAt}>{formatDateTime(notice.updatedAt)}</time>
              </>
            )}
          </p>
          {/* ⑥ 본문: {} 안의 문자열은 React가 글자로만 넣는다(자동 escape). <script>도 화면에 글자 그대로 보이고 실행되지 않는다
              dangerouslySetInnerHTML(HTML로 해석)은 쓰지 않는다 (XSS 방어). 줄바꿈은 CSS pre-wrap이 지킨다 */}
          <div className={styles.content}>{notice.content}</div>
        </article>
      )}

      {/* ⑦ 삭제 확인창: Modal을 칸 없이. 열리면 첫 버튼 [취소]에 커서 (잃는 쪽이 기본이 되지 않게) */}
      {confirmOpen && (
        <Modal title={messageOf('MODAL_DELETE_NOTICE_TITLE')} onClose={() => setConfirmOpen(false)} closable={!deleting}>
          <p className={styles.confirmDesc}>{messageOf('MODAL_DELETE_NOTICE_DESC')}</p>
          <div className={modalStyles.actions}>
            <button type="button" className={modalStyles.secondary} onClick={() => setConfirmOpen(false)} disabled={deleting}>
              {messageOf('BUTTON_CANCEL')}
            </button>
            <button type="button" className={modalStyles.danger} onClick={remove} disabled={deleting}>
              {messageOf(deleting ? 'BUTTON_DELETING' : 'BUTTON_DELETE')}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
