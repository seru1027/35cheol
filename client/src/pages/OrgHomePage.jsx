import { useOutletContext } from 'react-router';
import PageTitle from '../components/PageTitle.jsx';
import { messageOf } from '../messages.js';
import MemberBox from './MemberBox.jsx';
import NoticeBox from './NoticeBox.jsx';
import styles from './OrgHomePage.module.css';

// SCR-ORG-03 동아리 홈 (/orgs/:orgId). 동아리 레이아웃(SCR-ORG-00) 안의 index 화면
// 박스가 각자 자기 API를 부른다 (NOTICE-01, MEMBER-01). ORG-03은 다시 부르지 않는다
export default function OrgHomePage() {
  // 동아리 레이아웃이 넘긴 값
  const { orgs, orgName } = useOutletContext();

  // ① 제목 = 동아리명 (ORG-02 목록에서). 홈에는 오른쪽 행동 버튼 없음
  // 이름을 못 찾을 때: 목록 응답 전·방금 만든 동아리(갱신 전)면 비워 두고 곧 채운다 / 목록이 실패(null)했으면 '동아리 홈'
  const title = orgName ?? (orgs === null ? messageOf('ORG_HOME_FALLBACK_TITLE') : '');

  return (
    <section>
      <PageTitle title={title} />
      {/* 2열: 왼쪽 공지 / 오른쪽 가입 관리 → 멤버 (와이어프레임 순서) */}
      <div className={styles.grid}>
        <NoticeBox />
        <div className={styles.side}>
          <MemberBox />
        </div>
      </div>
    </section>
  );
}
