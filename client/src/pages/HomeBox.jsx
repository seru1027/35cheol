import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { messageOf } from '../messages.js';
import styles from './OrgHomePage.module.css';

// 동아리 홈(SCR-ORG-03) 박스 세 개가 함께 쓰는 껍데기와 불러오기 (DESIGN.md home-box)
// 박스마다 따로 불러오고 따로 실패한다: 한 박스가 실패해도 다른 박스는 그대로 (화면정의서 '박스 하나 실패')

// 박스 하나의 데이터 불러오기 (직접 만든 훅: 이름이 use로 시작하고 안에서 다른 훅을 쓰는 함수)
// fetcher: 성공이면 화면에 쓸 데이터, 실패면 null을 돌려주는 async 함수
// 돌려주는 것: status('loading' | 'error' | 'ok'), data, retry(다시 시도), setData(발급 뒤 코드만 바꾸기 등)
export function useBoxData(fetcher) {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [attempt, setAttempt] = useState(0);
  // fetcher는 그릴 때마다 새로 만들어지는 함수라 effect 의존성에 넣으면 매번 다시 부른다
  // ref에 최신 함수를 두고 effect는 '처음 + 다시 시도'에만 실행한다 (Modal.jsx의 closeRef와 같은 방식)
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let ignore = false; // 다시 시도를 빠르게 두 번 눌렀을 때 먼저 보낸 요청의 늦은 응답은 버린다
    fetcherRef.current().then((data) => {
      if (ignore) return;
      setState(data === null ? { status: 'error', data: null } : { status: 'ok', data });
    });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  function retry() {
    setState({ status: 'loading', data: null }); // 눌린 것이 보이게 '불러오는 중…'부터
    setAttempt((n) => n + 1);
  }

  function setData(update) {
    setState((prev) => ({ ...prev, data: update(prev.data) }));
  }

  return { ...state, retry, setData };
}

// 박스 껍데기: 머리(제목 + 오른쪽 버튼) → 로딩 / 오류 / 내용
// 화면 읽기 프로그램이 박스를 하나의 구역으로 알도록 section + aria-labelledby(제목)
export function HomeBox({ title, actions, status, onRetry, children }) {
  const titleId = useId();
  return (
    <section className={styles.box} aria-labelledby={titleId}>
      <div className={styles.boxHead}>
        <h2 id={titleId} className={styles.boxTitle}>{title}</h2>
        {actions && <div className={styles.boxActions}>{actions}</div>}
      </div>
      {status === 'loading' && <p className={styles.note} role="status">{messageOf('LOADING')}</p>}
      {status === 'error' && (
        // 그 박스 안에만 오류 (조회 실패라 토스트 없음, 결정 K)
        <div className={styles.boxError} role="alert">
          <p className={styles.note}>{messageOf('BOX_LOAD_FAILED')}</p>
          <button type="button" className={styles.utility} onClick={onRetry}>{messageOf('BUTTON_RETRY')}</button>
        </div>
      )}
      {status === 'ok' && children}
    </section>
  );
}

// → : 박스 전체 목록으로 가는 링크. 글자 없는 아이콘이라 이름(aria-label)을 붙인다
export function MoreLink({ to, label }) {
  return (
    <Link to={to} className={styles.iconLink} aria-label={label} title={label}>
      <ArrowIcon />
    </Link>
  );
}

// → 아이콘. 굵기 1.5 (다른 선 아이콘과 맞춤)
export function ArrowIcon() {
  return (
    <svg className={styles.arrow} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
