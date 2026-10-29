import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';

import UserModel from '../models/User';

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags:
 *       - Users
 *     responses:
 *       '200':
 *         description: Список пользователей успешно получен
 *       '500':
 *         description: Ошибка сервера
 *
 *   post:
 *     summary: Создать пользователя
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Анна
 *     responses:
 *       '201':
 *         description: Пользователь успешно создан
 *       '400':
 *         description: Некорректные данные
 *       '500':
 *         description: Ошибка сервера
 *
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор пользователя в MongoDB
 *     responses:
 *       '200':
 *         description: Пользователь найден
 *       '400':
 *         description: Некорректный ID пользователя
 *       '404':
 *         description: Пользователь не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   patch:
 *     summary: Обновить пользователя по ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор пользователя в MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Анна Жалдак
 *     responses:
 *       '200':
 *         description: Пользователь успешно обновлён
 *       '400':
 *         description: Некорректные данные или ID
 *       '404':
 *         description: Пользователь не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор пользователя в MongoDB
 *     responses:
 *       '200':
 *         description: Пользователь успешно удалён
 *       '400':
 *         description: Некорректный ID пользователя
 *       '404':
 *         description: Пользователь не найден
 *       '500':
 *         description: Ошибка сервера
 */

// Получение всех пользователей
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение одного пользователя по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID пользователя' });
      return;
    }

    const user = await UserModel.findById(id);

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание пользователя
router.post('/', async (req: Request, res: Response) => {
  try {
    const name = req.body?.name;

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'Поле name обязательно и должно быть непустой строкой',
      });
      return;
    }

    const newUser = await UserModel.create({
      name: name.trim(),
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление пользователя
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID пользователя' });
      return;
    }

    const name = req.body?.name;

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'Поле name обязательно и должно быть непустой строкой',
      });
      return;
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true },
    );

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление пользователя
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID пользователя' });
      return;
    }

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;