
import 'dotenv/config';
import express, { type Express } from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import usersRouter from './routers/users';
import productsRouter from './routers/products';
import ordersRouter from './routers/orders';
import logger from './middlewares/logger';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web API',
      version: '1.0.0',
      description: 'Документация API пользователей, товаров и заказов',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./routers/*.ts', './routers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(logger);
app.use(express.static(path.join(process.cwd(), 'static')));

app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
      console.log(`Документация Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();
