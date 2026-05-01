import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const questionsDir = join(__dirname, '..', 'data', 'questions');

const DOMAIN_CONFIG = [
  { file: 'domain1.json', count: 14 },
  { file: 'domain2.json', count: 9 },
  { file: 'domain3.json', count: 10 },
  { file: 'domain4.json', count: 10 },
  { file: 'domain5.json', count: 7 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadDomain(file) {
  try {
    return JSON.parse(readFileSync(join(questionsDir, file), 'utf8'));
  } catch {
    return [];
  }
}

export function sampleQuestions() {
  const selected = [];
  for (const { file, count } of DOMAIN_CONFIG) {
    const pool = loadDomain(file);
    const shuffled = shuffle(pool);
    selected.push(...shuffled.slice(0, count));
  }
  return shuffle(selected);
}
