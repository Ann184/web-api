
import 'dotenv/config';
import express, { type Express } from 'express';
import mongoose from 'mongoose';
import path from 'node:path';

import usersRouter from './routers/users';
import logger from './middlewares/logger';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(logger);
app.use(express.static(path.join(process.cwd(), 'static')));
app.use('/users', usersRouter);

async function startServer(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('Не задана переменная MONGODB_URI в файле .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Подключение к MongoDB установлено');

    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();
