import { useOutletContext } from 'react-router';
import PageTitle from '../components/PageTitle.jsx';
import { messageOf } from '../messages.js';
import JoinBox from './JoinBox.jsx';
import MemberBox from './MemberBox.jsx';
import NoticeBox from './NoticeBox.jsx';
import styles from './OrgHomePage.module.css';

// SCR-ORG-03 동아리 홈 (/orgs/:orgId). 동아리 레이아웃(SCR-ORG-00) 안의 index 화면
// 박스 세 개가 각자 자기 API를 부른다 (NOTICE-01, MEMBER-01, 회장·운영진만 JOIN-01·03). ORG-03은 다시 부르지 않는다
export default function OrgHomePage() {
  // 동아리 레이아웃이 넘긴 값
  const { orgs, orgName, myRole } = useOutletContext();
  // 역할에 따른 세 겹 중 '화면 숨김 + 호출 생략': 일반 회원은 JoinBox를 그리지 않으므로 그 안의 JOIN-01·03 요청도 없다
  // 세 번째 겹(서버 차단)은 역할 미들웨어. 여기 판단은 화면 표시용일 뿐이다 (명세 ORG-03 myRole)
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

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
          {canManage && <JoinBox />}
          <MemberBox />
        </div>
      </div>
    </section>
  );
}
