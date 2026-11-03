import { useEffect, useState } from 'react';
import { api } from '../api.js';
import styles from './HomePage.module.css';

// 임시 / 화면. 로그인 성공 뒤 이동할 곳이 필요해서 둔다
// F2에서 공통 레이아웃(SCR-COMMON-01) + 메인(SCR-ORG-01)으로 바꾼다
export default function HomePage() {
  const [me, setMe] = useState(undefined); // undefined: 응답 전, null: 로그인 안 됨, 객체: 로그인됨

  // 들어오면 /me를 부른다. 쿠키는 브라우저가 붙인다 (자바스크립트는 HttpOnly 쿠키를 읽지 못함)
  useEffect(() => {
    api('/api/auth/me').then(({ status, data }) => setMe(status === 200 ? data : null));
  }, []);

  return (
    <main className={styles.page}>
      {me === undefined && <p>확인 중…</p>}
      {me === null && <p>로그인 안 됨</p>}
      {me && <p>로그인됨: {me.name} ({me.loginId})</p>}
    </main>
  );
}
