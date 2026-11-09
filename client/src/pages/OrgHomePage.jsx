import { useOutletContext } from 'react-router';
import PageTitle from '../components/PageTitle.jsx';
import { messageOf } from '../messages.js';

// SCR-ORG-03 동아리 홈 (/orgs/:orgId). 동아리 레이아웃(SCR-ORG-00) 안의 index 화면
// F4-1: 제목 줄만. 공지·멤버·가입 관리 박스는 F4-2
export default function OrgHomePage() {
  // 동아리 레이아웃이 넘긴 값. ORG-03은 다시 부르지 않는다
  const { orgs, orgName } = useOutletContext();

  // ① 제목 = 동아리명 (ORG-02 목록에서). 홈에는 오른쪽 행동 버튼 없음
  // 이름을 못 찾을 때: 목록 응답 전·방금 만든 동아리(갱신 전)면 비워 두고 곧 채운다 / 목록이 실패(null)했으면 '동아리 홈'
  const title = orgName ?? (orgs === null ? messageOf('ORG_HOME_FALLBACK_TITLE') : '');

  return (
    <section>
      <PageTitle title={title} />
    </section>
  );
}
