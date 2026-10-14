const express = require('express');
const notFound = require('./middlewares/notFound');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);

module.exports = app;
