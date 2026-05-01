import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import questionsRouter from './routes/questions.js';
import resultsRouter from './routes/results.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const resultsFile = join(dataDir, 'results.json');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(resultsFile)) writeFileSync(resultsFile, '[]', 'utf8');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/results', resultsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
