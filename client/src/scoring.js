export const PASSING_SCORE = 720;
export const TOTAL_QUESTIONS = 50;

export function calcScaledScore(rawCorrect) {
  return Math.round(100 + (rawCorrect / TOTAL_QUESTIONS) * 900);
}

export function calcDomainScores(questions, answers) {
  const domains = {};
  questions.forEach((q, i) => {
    const d = q.domain;
    if (!domains[d]) domains[d] = { domainName: q.domainName, correct: 0, total: 0 };
    domains[d].total += 1;
    if (answers[i] === q.correctAnswer) domains[d].correct += 1;
  });
  return domains;
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
