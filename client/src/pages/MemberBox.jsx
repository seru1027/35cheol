import { useOutletContext } from 'react-router';
import { api } from '../api.js';
import { messageOf } from '../messages.js';
import { HomeBox, MoreLink, useBoxData } from './HomeBox.jsx';
import styles from './OrgHomePage.module.css';

const PREVIEW_COUNT = 5; // 결정 M: 총 인원 + 앞 5명

// SCR-ORG-03 ④ 멤버 박스 (MEMBER-01). 모든 역할이 같은 박스
// 서버 정렬(역할 순 → 가입 순) 그대로 앞 5명. 이름·역할만 쓴다 (일반 회원 응답에는 그 둘만 온다)
export default function MemberBox() {
  const { orgId } = useOutletContext();
  const { status, data: members, retry } = useBoxData(async () => {
    const result = await api(`/api/orgs/${orgId}/members`);
    return result.status === 200 ? result.data.members : null; // 총 인원이 필요해 전체를 둔다
  });

  // 제목에 총 인원. 불러오기 전·실패면 '멤버'만
  const title = members ? messageOf('BOX_MEMBERS_COUNT').replace('{n}', members.length) : messageOf('BOX_MEMBERS');

  return (
    <HomeBox
      title={title}
      status={status}
      onRetry={retry}
      actions={<MoreLink to={`/orgs/${orgId}/members`} label={messageOf('LINK_ALL_MEMBERS')} />}
    >
      <ul className={styles.list}>
        {/* 목록에는 최소 1명(나)이 있어 빈 목록 문구가 없다 (명세 MEMBER-01). key: 일반 회원 응답에는 id가 없어 순서를 쓴다 */}
        {members?.slice(0, PREVIEW_COUNT).map((member, index) => (
          <li key={member.membershipId ?? index} className={styles.memberRow}>
            <span className={styles.memberName}>{member.name}</span>
            <span className={styles.meta}>{messageOf(`ROLE_${member.role}`)}</span>
          </li>
        ))}
      </ul>
    </HomeBox>
  );
}
