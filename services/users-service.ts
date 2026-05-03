import express from 'express';
const app = express();
app.use(express.json());

const users = [
  { id: '1', name: 'Aarav Shah', email: 'aarav@example.com' },
  { id: '2', name: 'Priya Nair', email: 'priya@example.com' },
];

app.get('/users', (_req, res) => res.json(users));
app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.listen(3001, () => console.log('Users service on :3001'));