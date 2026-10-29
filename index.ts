import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';

import logger from './middlewares/logger';
import usersRouter from './routers/users';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(logger);

app.use(express.static(path.join(process.cwd(), 'static')));
app.use('/users', usersRouter);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('Подключение к MongoDB установлено');

    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

startServer();