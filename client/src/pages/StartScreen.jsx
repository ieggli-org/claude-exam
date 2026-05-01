import { useState } from 'react';
import { fetchQuestions } from '../api.js';

export default function StartScreen({ onStart, onHistory }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('exam');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError('');
    setLoading(true);
    try {
      const questions = await fetchQuestions();
      onStart({ playerName: name.trim(), mode, questions });
    } catch {
      setError('Failed to load questions. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card start-card">
      <h2>Welcome to the Exam Simulator</h2>
      <p className="subtitle">
        50 randomly selected questions · Passing score: 720/1000 · ~35 correct needed
      </p>

      <div className="form-group">
        <label htmlFor="name">Your Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          placeholder="Enter your name"
          className="input"
        />
      </div>

      <div className="form-group">
        <label>Mode</label>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'study' ? 'active' : ''}`}
            onClick={() => setMode('study')}
          >
            📚 Study Mode
            <span className="mode-desc">Immediate feedback after each question</span>
          </button>
          <button
            className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
            onClick={() => setMode('exam')}
          >
            🎓 Exam Mode
            <span className="mode-desc">Feedback only at the end</span>
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="start-actions">
        <button className="btn btn-primary" onClick={handleStart} disabled={loading}>
          {loading ? 'Loading questions…' : 'Start Exam'}
        </button>
        <button className="btn btn-secondary" onClick={onHistory}>
          View History
        </button>
      </div>
    </div>
  );
}
