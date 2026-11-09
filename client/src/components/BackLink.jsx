import { Link } from 'react-router';
import styles from './BackLink.module.css';

// 하위 화면 맨 위의 '← 상위 화면' 링크 (DESIGN.md org-layout 상위 링크)
// 브라우저 뒤로 가기(navigate(-1))가 아니라 늘 같은 곳으로 간다: 주소를 직접 열었거나 새 탭이어도, 어디서 들어왔든 결과가 같게
//
// to     가는 곳 (예: /orgs/8)
// label  글자 (예: '동아리 홈')
export default function BackLink({ to, label }) {
  return (
    <Link to={to} className={styles.link}>
      <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M12.5 8h-9M7.5 3.5 3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}
