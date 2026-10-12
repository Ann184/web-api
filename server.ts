import express, { type Express } from 'express';
import path from 'node:path';

import usersRouter from './routers/users';
import logger from './middlewares/logger';

const app: Express = express();
const PORT = 5000;

// Разбор JSON в теле запроса
app.use(express.json());

// Кастомный миддлвейр для логирования запросов
app.use(logger);

// Обработка статических файлов из папки static
app.use(express.static(path.join(process.cwd(), 'static')));

// Группировка маршрутов пользователей
app.use('/user', usersRouter);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});