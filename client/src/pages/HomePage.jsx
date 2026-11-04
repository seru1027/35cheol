import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import StatusPanel from '../components/StatusPanel.jsx';
import { messageOf } from '../messages.js';
import styles from './HomePage.module.css';

// 임시 / 본문 (공통 레이아웃의 본문 자리). F3에서 메인(SCR-ORG-01)으로 바꾼다
// 본문에 조회가 하나 있어야 로딩·500 패널(SCR-COMMON-02)과 사용 중 401을 확인할 수 있어서, ORG-02를 직접 불러 이름만 나열한다
export default function HomePage() {
  const [orgs, setOrgs] = useState(undefined); // undefined: 응답 전, null: 실패, 배열: 내 동아리

  // [다시 시도]가 같은 조회를 다시 부를 수 있게 함수로 둔다
  const loadOrgs = useCallback(async () => {
    const { status, data } = await api('/api/orgs');
    if (status === 200) setOrgs(data.orgs);
    else if (status !== 401) setOrgs(null); // 401은 api.js 공통 처리가 /login으로 보낸다
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  // [다시 시도]: 로딩 패널로 바꾼 뒤 같은 조회를 다시 요청한다 (눌린 것이 보이게)
  function retry() {
    setOrgs(undefined);
    loadOrgs();
  }

  return (
    <section>
      {/* 본문 제목 줄 (화면정의서 결정 B: 페이지명은 상단바가 아니라 여기). 로딩·오류 때도 남긴다 */}
      <h1 className={styles.title}>내 동아리</h1>
      {orgs === undefined && <StatusPanel kind="loading" />}
      {orgs === null && <StatusPanel kind="error" onRetry={retry} />}
      {orgs?.length === 0 && <p className={styles.note}>{messageOf('MY_ORGS_EMPTY')}</p>}
      {orgs?.length > 0 && (
        <ul className={styles.list}>
          {orgs.map((org) => (
            <li key={org.orgId}>{org.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
