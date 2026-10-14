const express = require('express');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
