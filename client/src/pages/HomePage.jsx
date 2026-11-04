import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { messageOf } from '../messages.js';
import styles from './HomePage.module.css';

// 임시 / 본문 (공통 레이아웃의 본문 자리). F3에서 메인(SCR-ORG-01)으로 바꾼다
// 본문에 조회가 하나 있어야 로딩·500 패널(F2-2)과 사용 중 401을 확인할 수 있어서, ORG-02를 직접 불러 이름만 나열한다
export default function HomePage() {
  const [orgs, setOrgs] = useState(undefined); // undefined: 응답 전, null: 실패, 배열: 내 동아리

  useEffect(() => {
    api('/api/orgs').then(({ status, data }) => {
      if (status === 200) setOrgs(data.orgs);
      else if (status !== 401) setOrgs(null); // 401은 api.js 공통 처리가 /login으로 보낸다
    });
  }, []);

  return (
    <section>
      {/* 본문 제목 줄 (화면정의서 결정 B: 페이지명은 상단바가 아니라 여기) */}
      <h1 className={styles.title}>내 동아리</h1>
      {/* F2-2에서 공통 상태 패널로 바꾼다 */}
      {orgs === undefined && <p className={styles.note} role="status">불러오는 중…</p>}
      {orgs === null && <p className={styles.note}>{messageOf('INTERNAL_SERVER_ERROR')}</p>}
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
