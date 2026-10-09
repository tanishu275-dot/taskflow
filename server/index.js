import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* ---------------- health ---------------- */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ---------------- auth ---------------- */

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const normalized = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email: normalized, passwordHash },
  });

  res.status(201).json({ id: user.id, email: user.email });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token });
});

/* ---------------- tasks ---------------- */

app.get('/api/tasks', requireAuth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(tasks);
});

app.get('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = await prisma.task.create({
    data: { title: title.trim(), userId: req.userId },
  });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findFirst({
    where: { id, userId: req.userId },
  });
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

app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  await prisma.task.delete({ where: { id } });
  res.status(204).end();
});

/* ---------------- start ---------------- */

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});