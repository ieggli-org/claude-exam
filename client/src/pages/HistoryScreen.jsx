import { useState, useEffect } from 'react';
import { fetchHistory } from '../api.js';
import { formatDuration, PASSING_SCORE } from '../scoring.js';

export default function HistoryScreen({ onBack }) {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id) {
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="card history-card">
      <h2>Exam History</h2>
      {loading && <p>Loading…</p>}
      {!loading && history.length === 0 && <p>No past exams yet.</p>}
      {!loading && history.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Name</th><th>Date</th><th>Score</th><th>Result</th><th>Mode</th><th>Duration</th><th></th>
            </tr>
          </thead>
          <tbody>
            {history.map(r => (
              <>
                <tr key={r.id} className="history-row">
                  <td>{r.playerName}</td>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td><strong>{r.score}</strong></td>
                  <td className={r.passed ? 'pct-pass' : 'pct-fail'}>{r.passed ? 'PASS' : 'FAIL'}</td>
                  <td>{r.mode}</td>
                  <td>{formatDuration(r.duration)}</td>
                  <td><button className="btn-link" onClick={() => toggle(r.id)}>
                    {expanded === r.id ? '▲' : '▼'}
                  </button></td>
                </tr>
                {expanded === r.id && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={7}>
                      <table className="domain-table nested">
                        <thead><tr><th>Domain</th><th>Correct</th><th>Total</th><th>%</th></tr></thead>
                        <tbody>
                          {Object.entries(r.domainScores || {}).map(([d, ds]) => (
                            <tr key={d}>
                              <td>{ds.domainName}</td>
                              <td>{ds.correct}</td>
                              <td>{ds.total}</td>
                              <td>{Math.round((ds.correct / ds.total) * 100)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1.5rem' }}>
        ← Start New Exam
      </button>
    </div>
  );
}
