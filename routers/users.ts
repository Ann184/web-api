import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();

const usersFilePath = path.join(process.cwd(), 'users.txt');

interface User {
  id: number;
  name: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, '', 'utf-8');
  }

  const fileContent = fs.readFileSync(usersFilePath, 'utf-8');

  if (!fileContent.trim()) {
    return [];
  }

  const lines = fileContent.trim().split('\n');

  const users: User[] = lines.map((line) => {
    const [id, name] = line.split(',');

    return {
      id: Number(id),
      name: name ? name.trim() : '',
    };
  });

  return users;
}

function writeUsers(users: User[]): void {
  const fileContent = users
    .map((u) => `${u.id},${u.name}`)
    .join('\n');

  fs.writeFileSync(usersFilePath, fileContent, 'utf-8');
}

// Получение всех пользователей
router.get('/', (req: Request, res: Response) => {
  const users = readUsers();
  res.json(users);
});

// Получение одного пользователя по ID
router.get('/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json(user);
});

// Создание пользователя
router.post('/', (req: Request, res: Response) => {
  const users = readUsers();

  const newUser: User = {
    id: Date.now(),
    name: req.body.name,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// Обновление пользователя
router.patch('/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  if (req.body.name) {
    user.name = req.body.name;
  }

  writeUsers(users);
  res.json(user);
});

// Удаление пользователя
router.delete('/:id', (req: Request, res: Response) => {
  const users = readUsers();
  const userId = Number(req.params.id);

  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  const [deletedUser] = users.splice(index, 1);

  writeUsers(users);
  res.json(deletedUser);
});

export default router;