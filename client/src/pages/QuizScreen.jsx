import { useState, useEffect, useRef } from 'react';
import { saveResult } from '../api.js';
import { calcScaledScore, calcDomainScores, formatDuration, PASSING_SCORE } from '../scoring.js';

export default function QuizScreen({ playerName, mode, questions, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[current];
  const total = questions.length;
  const progress = ((current) / total) * 100;

  function handleSelect(letter) {
    if (selected !== null) return;
    setSelected(letter);
    if (mode === 'study') setRevealed(true);
  }

  async function handleNext() {
    const newAnswers = [...answers, selected];
    if (current + 1 >= total) {
      const raw = newAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
      const score = calcScaledScore(raw);
      const domainScores = calcDomainScores(questions, newAnswers);
      const result = {
        playerName,
        mode,
        score,
        rawScore: raw,
        total,
        passed: score >= PASSING_SCORE,
        passingScore: PASSING_SCORE,
        duration: elapsed,
        domainScores,
        answers: newAnswers.map((a, i) => ({
          questionId: questions[i].id,
          question: questions[i].text,
          options: questions[i].options,
          selected: a,
          correctAnswer: questions[i].correctAnswer,
          explanation: questions[i].explanation,
          correct: a === questions[i].correctAnswer,
          domain: questions[i].domain,
          domainName: questions[i].domainName,
        })),
      };
      try { await saveResult(result); } catch { /* non-fatal */ }
      onFinish(result);
    } else {
      setAnswers(newAnswers);
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function optionClass(letter) {
    if (!revealed) return selected === letter ? 'option selected' : 'option';
    if (letter === q.correctAnswer) return 'option correct';
    if (letter === selected && letter !== q.correctAnswer) return 'option wrong';
    return 'option';
  }

  return (
    <div className="quiz-wrapper">
      <div className="quiz-meta">
        <span className="domain-badge">Domain {q.domain} · {q.domainName}</span>
        {q.scenario && <span className="scenario-tag">{q.scenario}</span>}
        <span className="timer">{formatDuration(elapsed)}</span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">Question {current + 1} of {total}</p>

      <div className="card question-card">
        <p className="question-text">{q.text}</p>

        <div className="options">
          {q.options.map(opt => (
            <button
              key={opt.letter}
              className={optionClass(opt.letter)}
              onClick={() => handleSelect(opt.letter)}
              disabled={selected !== null}
            >
              <span className="option-letter">{opt.letter}</span>
              <span className="option-text">{opt.text}</span>
            </button>
          ))}
        </div>

        {revealed && (
          <div className={`explanation ${selected === q.correctAnswer ? 'explanation-correct' : 'explanation-wrong'}`}>
            <strong>{selected === q.correctAnswer ? '✓ Correct!' : `✗ Incorrect. Correct answer: ${q.correctAnswer}`}</strong>
            <p>{q.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button className="btn btn-primary next-btn" onClick={handleNext}>
            {current + 1 >= total ? 'Finish Exam' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
