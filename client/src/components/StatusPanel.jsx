import { Link } from 'react-router';
import { messageOf } from '../messages.js';
import styles from './StatusPanel.module.css';

// SCR-COMMON-02 공통 상태 패널. 본문 자리(또는 앱 시작 때는 화면 전체)에 들어간다
// 조회 화면은 응답 상태에 맞는 kind 하나만 골라 넘긴다. 401은 패널 없이 api.js가 /login으로 보낸다
//
// kind
//   loading   ① 조회 응답 전. 글자만 (스피너 없음)
//   pending   ② 403 승인 대기중 → [메인으로]          (F4 동아리 레이아웃에서 씀)
//   forbidden ③ 403 권한 없음   → [동아리 홈으로]    (F4, orgId 필요)
//   notFound  ④ 404 (이유는 구분하지 않음 = 존재 숨김) → [메인으로]
//   error     ⑤ 500·네트워크   → [다시 시도] = onRetry로 같은 조회를 다시 요청
const PANELS = {
  pending: { title: 'PANEL_PENDING_TITLE', desc: 'PANEL_PENDING_DESC', action: 'main' },
  forbidden: { title: 'PANEL_FORBIDDEN_TITLE', desc: 'PANEL_FORBIDDEN_DESC', action: 'orgHome' },
  notFound: { title: 'PANEL_NOT_FOUND_TITLE', desc: 'PANEL_NOT_FOUND_DESC', action: 'main' },
  error: { title: 'PANEL_ERROR_TITLE', desc: 'PANEL_ERROR_DESC', action: 'retry' },
};

// fullScreen: 앱 시작처럼 레이아웃 밖이면 화면 전체 가운데. 아니면 본문 자리 가운데
// titleAs: 화면에 다른 제목(h1)이 있으면 h2(기본), 패널이 화면의 전부면 h1
export default function StatusPanel({ kind, onRetry, orgId, fullScreen = false, titleAs: Title = 'h2' }) {
  const className = fullScreen ? `${styles.panel} ${styles.fullScreen}` : styles.panel;

  if (kind === 'loading') {
    return (
      <div className={className}>
        {/* role="status": 화면 읽기 프로그램이 지금 불러오는 중임을 알린다 */}
        <p className={styles.loading} role="status">{messageOf('LOADING')}</p>
      </div>
    );
  }

  const { title, desc, action } = PANELS[kind];
  return (
    // 오류는 role="alert"로 바로 알린다. 다시 시도 뒤 또 실패해도 다시 알린다 (패널이 새로 그려지므로)
    <div className={className} role={kind === 'error' ? 'alert' : undefined}>
      <Title className={styles.title}>{messageOf(title)}</Title>
      <p className={styles.desc}>{messageOf(desc)}</p>
      {action === 'main' && <Link to="/" className={styles.secondary}>{messageOf('BUTTON_GO_MAIN')}</Link>}
      {action === 'orgHome' && (
        <Link to={`/orgs/${orgId}`} className={styles.secondary}>{messageOf('BUTTON_GO_ORG_HOME')}</Link>
      )}
      {action === 'retry' && (
        <button type="button" className={styles.primary} onClick={onRetry}>{messageOf('BUTTON_RETRY')}</button>
      )}
    </div>
  );
}
