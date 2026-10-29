import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';

import OrderModel from '../models/Order';
import ProductModel from '../models/Product';

const router = express.Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Получить список всех заказов
 *     tags:
 *       - Orders
 *     responses:
 *       '200':
 *         description: Список заказов успешно получен
 *       '500':
 *         description: Ошибка сервера
 *
 *   post:
 *     summary: Создать заказ
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - product
 *               - quantity
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Анна
 *               product:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *                 description: ID существующего товара в MongoDB
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Заказ успешно создан
 *       '400':
 *         description: Некорректные данные или недостаточно товара
 *       '404':
 *         description: Товар не найден
 *       '500':
 *         description: Ошибка сервера
 *
 * /orders/{id}:
 *   get:
 *     summary: Получить заказ по ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор заказа в MongoDB
 *     responses:
 *       '200':
 *         description: Заказ найден
 *       '400':
 *         description: Некорректный ID заказа
 *       '404':
 *         description: Заказ не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   patch:
 *     summary: Обновить заказ по ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор заказа в MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Иван
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               status:
 *                 type: string
 *                 enum:
 *                   - новый
 *                   - оплачен
 *                   - отправлен
 *                   - завершён
 *                   - отменён
 *                 example: оплачен
 *     responses:
 *       '200':
 *         description: Заказ успешно обновлён
 *       '400':
 *         description: Некорректные данные или недостаточно товара
 *       '404':
 *         description: Заказ или товар не найден
 *       '500':
 *         description: Ошибка сервера
 *
 *   delete:
 *     summary: Удалить заказ по ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор заказа в MongoDB
 *     responses:
 *       '200':
 *         description: Заказ успешно удалён, товар возвращён на склад
 *       '400':
 *         description: Некорректный ID заказа
 *       '404':
 *         description: Заказ не найден
 *       '500':
 *         description: Ошибка сервера
 */

// Получение всех заказов
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().populate('product');
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение одного заказа по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID заказа' });
      return;
    }

    const order = await OrderModel.findById(id).populate('product');

    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание заказа
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, product: productId, quantity } = req.body ?? {};

    if (typeof customerName !== 'string' || !customerName.trim()) {
      res.status(400).json({
        message: 'Поле customerName обязательно',
      });
      return;
    }

    if (!mongoose.isValidObjectId(productId)) {
      res.status(400).json({ message: 'Некорректный ID товара' });
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400).json({
        message: 'Количество должно быть целым числом больше нуля',
      });
      return;
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      res.status(404).json({ message: 'Товар не найден' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ message: 'Недостаточно товара на складе' });
      return;
    }

    const order = await OrderModel.create({
      customerName: customerName.trim(),
      product: product._id,
      quantity,
      totalPrice: product.price * quantity,
    });

    product.stock -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление заказа
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerName, quantity, status } = req.body ?? {};

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID заказа' });
      return;
    }

    const order = await OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    if (
      customerName === undefined &&
      quantity === undefined &&
      status === undefined
    ) {
      res.status(400).json({ message: 'Нет данных для обновления' });
      return;
    }

    if (customerName !== undefined) {
      if (typeof customerName !== 'string' || !customerName.trim()) {
        res.status(400).json({ message: 'Некорректное имя покупателя' });
        return;
      }

      order.customerName = customerName.trim();
    }

    if (status !== undefined) {
      const allowedStatuses = [
        'новый',
        'оплачен',
        'отправлен',
        'завершён',
        'отменён',
      ];

      if (
        typeof status !== 'string' ||
        !allowedStatuses.includes(status)
      ) {
        res.status(400).json({
          message: 'Недопустимый статус заказа',
          allowedStatuses,
        });
        return;
      }

      order.status = status as
        | 'новый'
        | 'оплачен'
        | 'отправлен'
        | 'завершён'
        | 'отменён';
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1) {
        res.status(400).json({ message: 'Некорректное количество' });
        return;
      }

      const product = await ProductModel.findById(order.product);

      if (!product) {
        res.status(404).json({ message: 'Товар заказа не найден' });
        return;
      }

      const difference = quantity - order.quantity;

      if (difference > product.stock) {
        res.status(400).json({ message: 'Недостаточно товара на складе' });
        return;
      }

      product.stock -= difference;
      await product.save();

      order.quantity = quantity;
      order.totalPrice = product.price * quantity;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Ошибка обновления заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление заказа
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Некорректный ID заказа' });
      return;
    }

    const order = await OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    const product = await ProductModel.findById(order.product);

    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    await OrderModel.findByIdAndDelete(id);

    res.json({ message: 'Заказ успешно удалён', order });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;