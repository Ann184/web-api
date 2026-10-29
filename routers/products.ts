import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import ProductModel from '../models/Product';

const router = express.Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags:
 *       - Products
 *     responses:
 *       '200':
 *         description: Список товаров успешно получен
 *       '500':
 *         description: Ошибка сервера
 *
 *   post:
 *     summary: Создать товар
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ноутбук
 *               description:
 *                 type: string
 *                 example: Рабочий ноутбук
 *               price:
 *                 type: number
 *                 example: 55000
 *               stock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       '201':
 *         description: Товар успешно создан
 *       '400':
 *         description: Некорректные данные
 *       '500':
 *         description: Ошибка сервера
 *
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор товара
 *     responses:
 *       '200':
 *         description: Товар найден
 *       '400':
 *         description: Некорректный ID товара
 *       '404':
 *         description: Товар не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   patch:
 *     summary: Обновить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Игровой ноутбук
 *               description:
 *                 type: string
 *                 example: Обновлённое описание
 *               price:
 *                 type: number
 *                 example: 65000
 *               stock:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Товар успешно обновлён
 *       '400':
 *         description: Некорректные данные
 *       '404':
 *         description: Товар не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   delete:
 *     summary: Удалить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор товара
 *     responses:
 *       '200':
 *         description: Товар успешно удалён
 *       '400':
 *         description: Некорректный ID товара
 *       '404':
 *         description: Товар не найден
 *       '500':
 *         description: Ошибка сервера
 */

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID товара' });
      return;
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Товар не найден' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body ?? {};

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'Поле name обязательно и должно быть непустой строкой',
      });
      return;
    }

    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      res.status(400).json({
        message: 'Поле price должно быть неотрицательным числом',
      });
      return;
    }

    if (
      stock !== undefined &&
      (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0)
    ) {
      res.status(400).json({
        message: 'Поле stock должно быть неотрицательным целым числом',
      });
      return;
    }

    if (description !== undefined && typeof description !== 'string') {
      res.status(400).json({
        message: 'Поле description должно быть строкой',
      });
      return;
    }

    const product = await ProductModel.create({
      name: name.trim(),
      description,
      price,
      stock,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID товара' });
      return;
    }

    const { name, description, price, stock } = req.body ?? {};
    const update: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          message: 'Название должно быть непустой строкой',
        });
        return;
      }
      update.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        res.status(400).json({
          message: 'Описание должно быть строкой',
        });
        return;
      }
      update.description = description;
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
        res.status(400).json({
          message: 'Цена должна быть неотрицательным числом',
        });
        return;
      }
      update.price = price;
    }

    if (stock !== undefined) {
      if (
        typeof stock !== 'number' ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        res.status(400).json({
          message: 'Количество на складе должно быть неотрицательным целым числом',
        });
        return;
      }
      update.stock = stock;
    }

    if (Object.keys(update).length === 0) {
      res.status(400).json({
        message: 'Не переданы поля для обновления',
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ message: 'Товар не найден' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID товара' });
      return;
    }

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: 'Товар не найден' });
      return;
    }

    res.json({ message: 'Товар успешно удалён', product });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;