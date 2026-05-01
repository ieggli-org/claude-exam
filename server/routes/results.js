import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsFile = join(__dirname, '..', 'data', 'results.json');

function readResults() {
  try {
    return JSON.parse(readFileSync(resultsFile, 'utf8'));
  } catch {
    return [];
  }
}

function writeResults(results) {
  writeFileSync(resultsFile, JSON.stringify(results, null, 2), 'utf8');
}

const router = Router();

router.post('/', (req, res) => {
  try {
    const result = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
    const results = readResults();
    results.push(result);
    writeResults(results);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save result', detail: err.message });
  }
});

router.get('/history', (_req, res) => {
  try {
    const results = readResults();
    res.json(results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history', detail: err.message });
  }
});

export default router;
