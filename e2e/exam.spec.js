import { test, expect } from '@playwright/test';

// Reusable helpers
async function selectMode(page, mode) {
  // Click the mode button by its specific name to avoid strict mode violation
  const label = mode === 'study' ? /study mode/i : /exam mode/i;
  await page.getByRole('button', { name: label }).click();
}

async function clickOption(page, index = 0) {
  // Options are <button class="option"> — click by index (0 = first = A)
  await page.locator('button.option').nth(index).click();
}

async function clickNext(page) {
  await page.getByRole('button', { name: /next question|finish exam/i }).click();
}

test.describe('Start Screen', () => {
  test('renders start screen with all elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Claude Certified Architect', { exact: false })).toBeVisible();
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start exam/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /study mode/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /exam mode/i })).toBeVisible();
  });

  test('requires name before starting', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start exam/i }).click();
    // Should not advance to quiz screen — name input still visible
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
  });

  test('navigates to history screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /view history/i }).click();
    await expect(page.getByRole('button', { name: /start new exam/i })).toBeVisible();
  });
});

test.describe('Study Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/name/i).fill('Test User');
    await selectMode(page, 'study');
    await page.getByRole('button', { name: /start exam/i }).click();
    await expect(page.locator('.progress-label')).toContainText('Question 1', { timeout: 10000 });
  });

  test('shows question with 4 option buttons', async ({ page }) => {
    await expect(page.locator('.progress-label')).toContainText('Question 1 of 50');
    await expect(page.locator('button.option')).toHaveCount(4);
    // Verify letter labels A B C D are present
    await expect(page.locator('.option-letter').nth(0)).toHaveText('A');
    await expect(page.locator('.option-letter').nth(1)).toHaveText('B');
    await expect(page.locator('.option-letter').nth(2)).toHaveText('C');
    await expect(page.locator('.option-letter').nth(3)).toHaveText('D');
  });

  test('shows timer counting up', async ({ page }) => {
    await expect(page.locator('.timer')).toBeVisible();
  });

  test('shows domain badge', async ({ page }) => {
    await expect(page.locator('.domain-badge')).toBeVisible();
  });

  test('shows immediate feedback on answer in study mode', async ({ page }) => {
    await clickOption(page, 0);
    // Explanation div should appear immediately
    await expect(page.locator('.explanation')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /next question/i })).toBeVisible();
  });

  test('can answer first question and advance to question 2', async ({ page }) => {
    await clickOption(page, 0);
    await clickNext(page);
    await expect(page.locator('.progress-label')).toContainText('Question 2 of 50', { timeout: 5000 });
  });
});

test.describe('Exam Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/name/i).fill('Exam User');
    await selectMode(page, 'exam');
    await page.getByRole('button', { name: /start exam/i }).click();
    await expect(page.locator('.progress-label')).toContainText('Question 1', { timeout: 10000 });
  });

  test('does not show explanation immediately after selecting answer', async ({ page }) => {
    await clickOption(page, 0);
    // In exam mode, explanation is NOT shown until the end
    await expect(page.locator('.explanation')).not.toBeVisible();
    // But Next button should appear
    await expect(page.getByRole('button', { name: /next question/i })).toBeVisible();
  });

  test('advances to next question without color feedback', async ({ page }) => {
    await clickOption(page, 0);
    await clickNext(page);
    await expect(page.locator('.progress-label')).toContainText('Question 2 of 50', { timeout: 5000 });
  });

  test('option is marked selected (not correct/wrong) after click', async ({ page }) => {
    await clickOption(page, 0);
    const firstOption = page.locator('button.option').nth(0);
    // Should have 'selected' class but NOT 'correct' or 'wrong'
    await expect(firstOption).toHaveClass(/selected/);
    await expect(firstOption).not.toHaveClass(/correct/);
    await expect(firstOption).not.toHaveClass(/wrong/);
  });
});

test.describe('Full Exam Completion', () => {
  async function runFullExam(page, mode) {
    await page.goto('/');
    await page.getByPlaceholder(/name/i).fill('Full User');
    await selectMode(page, mode);
    await page.getByRole('button', { name: /start exam/i }).click();
    await expect(page.locator('.progress-label')).toContainText('Question 1', { timeout: 10000 });

    for (let i = 0; i < 50; i++) {
      await clickOption(page, 0);
      await clickNext(page);
    }
  }

  test('shows scaled score on results screen after exam mode', async ({ page }) => {
    test.setTimeout(180000);
    await runFullExam(page, 'exam');
    // Score is a number between 100 and 1000
    await expect(page.locator('.score-value, [class*="score"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/pass|fail/i').first()).toBeVisible();
  });

  test('shows domain breakdown table', async ({ page }) => {
    test.setTimeout(180000);
    await runFullExam(page, 'exam');
    await expect(page.locator('.domain-breakdown, table, [class*="domain"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('shows retake and history buttons on results', async ({ page }) => {
    test.setTimeout(180000);
    await runFullExam(page, 'exam');
    await expect(page.getByRole('button', { name: /retake/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
  });

  test('retake returns to start screen', async ({ page }) => {
    test.setTimeout(180000);
    await runFullExam(page, 'exam');
    await page.getByRole('button', { name: /retake/i }).click({ timeout: 15000 });
    // Retake returns to start screen so user can pick name/mode again
    await expect(page.getByRole('button', { name: /start exam/i })).toBeVisible({ timeout: 5000 });
  });

  test('result appears in history after completion', async ({ page }) => {
    test.setTimeout(180000);
    await runFullExam(page, 'exam');
    await page.getByRole('button', { name: /history/i }).click({ timeout: 15000 });
    // History table should show at least one row
    await expect(page.locator('table tr, [class*="history-row"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('study mode exam shows explanation inline per question', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    await page.getByPlaceholder(/name/i).fill('Study Checker');
    await selectMode(page, 'study');
    await page.getByRole('button', { name: /start exam/i }).click();
    await expect(page.locator('.progress-label')).toContainText('Question 1', { timeout: 10000 });
    await clickOption(page, 0);
    // Study mode must show explanation on this screen, not at the end
    await expect(page.locator('.explanation')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('History Screen', () => {
  test('shows start new exam button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /view history/i }).click();
    await expect(page.getByRole('button', { name: /start new exam/i })).toBeVisible();
  });

  test('can navigate back to start screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /view history/i }).click();
    await page.getByRole('button', { name: /start new exam/i }).click();
    await expect(page.getByRole('button', { name: /start exam/i })).toBeVisible();
  });
});

test.describe('API Endpoints', () => {
  test('GET /api/questions returns exactly 50 domain-weighted questions', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/questions');
    expect(res.ok()).toBe(true);
    const questions = await res.json();
    expect(questions).toHaveLength(50);
    const d = questions.reduce((acc, q) => { acc[q.domain] = (acc[q.domain] || 0) + 1; return acc; }, {});
    expect(d[1]).toBe(14);
    expect(d[2]).toBe(9);
    expect(d[3]).toBe(10);
    expect(d[4]).toBe(10);
    expect(d[5]).toBe(7);
  });

  test('each question has required fields and valid correctAnswer', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/questions');
    const questions = await res.json();
    for (const q of questions) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctAnswer);
      expect(q.explanation).toBeTruthy();
    }
  });

  test('POST /api/results saves result and assigns id', async ({ request }) => {
    const result = {
      playerName: 'API Test',
      mode: 'exam',
      score: 720,
      rawScore: 35,
      total: 50,
      passed: true,
      passingScore: 720,
      duration: 1200,
      domainScores: {
        '1': { correct: 10, total: 14 },
        '2': { correct: 7, total: 9 },
        '3': { correct: 7, total: 10 },
        '4': { correct: 7, total: 10 },
        '5': { correct: 4, total: 7 },
      },
      answers: [{ questionId: 'd1-001', selected: 'A', correct: true }],
    };
    const res = await request.post('http://localhost:3001/api/results', { data: result });
    expect(res.ok()).toBe(true);
    const saved = await res.json();
    expect(saved.id).toBeTruthy();
    expect(saved.playerName).toBe('API Test');
    expect(saved.timestamp).toBeTruthy();
  });

  test('GET /api/results/history returns array sorted newest first', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/results/history');
    expect(res.ok()).toBe(true);
    const history = await res.json();
    expect(Array.isArray(history)).toBe(true);
    if (history.length >= 2) {
      expect(new Date(history[0].timestamp) >= new Date(history[1].timestamp)).toBe(true);
    }
  });
});
