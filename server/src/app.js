const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth');

const app = express();

// 프론트(다른 출처)가 쿠키를 실어 보내는 요청을 허용한다 (API 명세서 0-1)
// 맨 앞에 둔다: preflight(OPTIONS)가 NOT_FOUND로 끝나지 않고, 에러 응답에도 CORS 헤더가 붙어야 브라우저가 읽을 수 있다
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));

// 요청의 Cookie 헤더를 req.cookies 객체로 풀어 준다 (인증 미들웨어가 access_token을 읽음)
app.use(cookieParser());

app.use(express.json());

// body가 아예 없는 요청(빈 body, Content-Type 없음)은 빈 객체로 보고 검사한다 (API 명세서 0-4)
// Express 5는 이때 req.body가 undefined라서, req.body.loginId처럼 꺼내면 TypeError → 500이 된다
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
