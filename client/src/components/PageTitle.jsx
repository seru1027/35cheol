import styles from './PageTitle.module.css';

// SCR-ORG-00 ② 본문 제목 줄 (DESIGN.md org-layout). 동아리 안의 화면이 함께 쓴다
// 왼쪽: 페이지명(동아리 홈은 동아리명) / 오른쪽: 그 화면 전체에 대한 행동 버튼 (회장·운영진만, 넘기는 쪽이 판단)
//
// title    제목 글자. 비어 있으면(동아리명을 아직 모를 때) 줄 높이만 차지해 이름이 와도 아래가 밀리지 않는다
// count    제목 옆 개수 글자 (예: '6명', '3건'). 목록을 불러온 뒤에만 넘긴다. h1 안에 두어 '회원 6명'으로 함께 읽힌다
// actions  오른쪽 버튼들 (없으면 생략)
export default function PageTitle({ title, count, actions }) {
  return (
    <div className={styles.row}>
      <h1 className={styles.title}>
        {title}
        {count && <span className={styles.count}>{count}</span>}
      </h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
