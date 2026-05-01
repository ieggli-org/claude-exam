export async function fetchQuestions() {
  const res = await fetch('/api/questions');
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function saveResult(result) {
  const res = await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!res.ok) throw new Error('Failed to save result');
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch('/api/results/history');
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
