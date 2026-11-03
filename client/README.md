# client

동아리 관리 서비스의 프론트엔드. Vite + React(JavaScript), 라우팅은 React Router, 스타일은 CSS Modules.

## 실행

백엔드(`server/`)를 먼저 켠다 (`http://localhost:4000`).

```bash
npm install
cp .env.example .env
npm run dev
```

- 개발 서버 주소는 `http://localhost:5173`이다. 서버 `.env`의 `CLIENT_ORIGIN`과 같아야 CORS가 통과한다. 5173을 이미 쓰고 있으면 다른 포트로 넘어가지 않고 멈춘다(`strictPort`).
- `.env`는 커밋하지 않는다. `VITE_`로 시작하는 값은 브라우저 코드에 그대로 들어가므로 비밀 값을 넣지 않는다.

## 폴더

| 위치 | 내용 |
|---|---|
| `DESIGN.md` | 화면 모양(색, 글꼴, 간격, 둥글기, 부품 상태)의 원본 |
| `src/index.css` | `:root` 변수(DESIGN.md 값을 코드로 옮긴 곳)와 기본 규칙 |
| `src/api.js` | 모든 API 호출이 지나는 fetch 함수 |
| `src/App.jsx` | 라우팅 |
| `src/pages/` | 화면 하나 = `화면.jsx` + `화면.module.css` |

## 화면 구현 규칙

1. 모양의 원본은 `DESIGN.md`다. 화면에 들어갈 요소·동작·문구는 Figma `03 화면정의서`를 따른다.
2. 코드 값은 `src/index.css`의 `:root` 한 곳에만 둔다.
3. `.module.css`에는 `var(--...)`만 쓰고 숫자(색·px)를 직접 쓰지 않는다.
4. 데스크톱 폭 1440px 기준으로 만들고 확인한다.
5. 화면 하나 = `pages/화면.jsx` + `화면.module.css`.
