import express from 'express';
import { prisma } from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(tasks);
});

app.get('/api/tasks/:id', async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = await prisma.task.create({
    data: { title: title.trim() },
  });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body;
  const data = {};
  if (title !== undefined) data.title = title;
  if (done !== undefined) data.done = done;

  const task = await prisma.task.update({ where: { id }, data });
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  await prisma.task.delete({ where: { id } });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});




