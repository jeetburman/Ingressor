import express from 'express';
const app = express();
app.use(express.json());

const products = [
  { id: '1', name: 'Laptop', price: 999 },
  { id: '2', name: 'Keyboard', price: 79 },
];

app.get('/products', (_req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const p = products.find((p) => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.listen(3002, () => console.log('Products service on :3002'));