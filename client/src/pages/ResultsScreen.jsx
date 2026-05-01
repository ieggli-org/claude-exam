import { formatDuration, PASSING_SCORE } from '../scoring.js';

export default function ResultsScreen({ result, onRetake, onHistory }) {
  const { score, rawScore, total, passed, domainScores, duration, mode, playerName, answers } = result;

  return (
    <div className="card results-card">
      <h2>Exam Complete — {playerName}</h2>

      <div className={`score-display ${passed ? 'pass' : 'fail'}`}>
        <span className="score-number">{score}</span>
        <span className="score-badge">{passed ? 'PASS' : 'FAIL'}</span>
        <span className="score-sub">{rawScore}/{total} correct · Passing: {PASSING_SCORE}</span>
      </div>

      <h3>Domain Breakdown</h3>
      <table className="domain-table">
        <thead>
          <tr><th>Domain</th><th>Correct</th><th>Total</th><th>%</th></tr>
        </thead>
        <tbody>
          {Object.entries(domainScores).map(([d, { domainName, correct, total: dt }]) => (
            <tr key={d}>
              <td>{domainName}</td>
              <td>{correct}</td>
              <td>{dt}</td>
              <td className={correct / dt >= 0.7 ? 'pct-pass' : 'pct-fail'}>
                {Math.round((correct / dt) * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="duration-note">Time: {formatDuration(duration)}</p>

      {mode === 'exam' && answers && (
        <div className="review-section">
          <h3>Question Review</h3>
          {answers.map((a, i) => (
            <div key={i} className={`review-item ${a.correct ? 'review-correct' : 'review-wrong'}`}>
              <p className="review-q"><strong>Q{i + 1}.</strong> {a.question}</p>
              <p>Your answer: <strong>{a.selected}</strong> · Correct: <strong>{a.correctAnswer}</strong>
                {' '}{a.correct ? '✓' : '✗'}
              </p>
              <p className="review-explanation">{a.explanation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onRetake}>Retake Exam</button>
        <button className="btn btn-secondary" onClick={onHistory}>View History</button>
      </div>
    </div>
  );
}
