import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import importRouter from './routes/import';
import roiRouter from './routes/roi';

const app = express();
const PORT = process.env.SERVER_PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', importRouter);
app.use('/api', roiRouter);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export default app;
