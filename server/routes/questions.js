import { Router } from 'express';
import { sampleQuestions } from '../lib/sampler.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const questions = sampleQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load questions', detail: err.message });
  }
});

export default router;
