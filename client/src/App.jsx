import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import StartScreen from './pages/StartScreen.jsx';
import QuizScreen from './pages/QuizScreen.jsx';
import ResultsScreen from './pages/ResultsScreen.jsx';
import HistoryScreen from './pages/HistoryScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState('start');
  const [examState, setExamState] = useState(null);
  const [resultState, setResultState] = useState(null);

  function startExam({ playerName, mode, questions }) {
    setExamState({ playerName, mode, questions });
    setScreen('quiz');
  }

  function finishExam(result) {
    setResultState(result);
    setScreen('results');
  }

  function retake() {
    setExamState(null);
    setResultState(null);
    setScreen('start');
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Claude Certified Architect — Exam Simulator</h1>
      </header>
      <main className="app-main">
        {screen === 'start' && (
          <StartScreen onStart={startExam} onHistory={() => setScreen('history')} />
        )}
        {screen === 'quiz' && examState && (
          <QuizScreen
            playerName={examState.playerName}
            mode={examState.mode}
            questions={examState.questions}
            onFinish={finishExam}
          />
        )}
        {screen === 'results' && resultState && (
          <ResultsScreen
            result={resultState}
            onRetake={retake}
            onHistory={() => setScreen('history')}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen onBack={retake} />
        )}
      </main>
      <SpeedInsights />
    </div>
  );
}
