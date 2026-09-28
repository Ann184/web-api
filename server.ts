import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const app: Express = express();
const PORT = 5000;

app.use(express.json());

const usersFilePath = path.join(process.cwd(), 'users.txt'); // путь к файлу с пользователями

interface User {
  id: number;
  name: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) { // проверка на существование, если нет - создаем
    fs.writeFileSync(usersFilePath, '', 'utf-8');
  }

  // считываем файл в виде строки
  const fileContent: string = fs.readFileSync(usersFilePath, 'utf-8');

  if (!fileContent.trim()) {
    return [];
  }

  // разбиваем строку на отдельные записи
  const lines: string[] = fileContent.trim().split('\n');

  // преобразуем каждую строку "id,name" в объект User
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
  const fileContent = users.map((u) => `${u.id},${u.name}`).join('\n'); // формируем строку из массива пользователей
  
  fs.writeFileSync(usersFilePath, fileContent, 'utf-8'); // перезаписываем данные в файл
}

app.get('/user', (req: Request, res: Response) => { // получение всех пользователей
  const users = readUsers();
  res.json(users);
});

app.get('/user/:id', (req: Request, res: Response) => { // получение одного пользователя по id
  const users = readUsers();
  const userId = Number(req.params.id);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.json(user);
});

app.post('/user', (req: Request, res: Response) => { // создание нового пользователя
  const users = readUsers();

  const newUser: User = {
    id: Date.now(), // генерация динамического id
    name: req.body.name,
  };

  users.push(newUser);
  writeUsers(users); // сохраняем обновленный массив

  res.status(201).json(newUser);
});

app.patch('/user/:id', (req: Request, res: Response) => { // обновление данных пользователя по id
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

  writeUsers(users); // перезаписываем файл с новыми данными
  res.json(user);
});

app.delete('/user/:id', (req: Request, res: Response) => { // удаление пользователя по id
  const users = readUsers();
  const userId = Number(req.params.id);

  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  const [deletedUser] = users.splice(index, 1);
  
  writeUsers(users); // сохраняем изменения после удаления

  res.json(deletedUser);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});