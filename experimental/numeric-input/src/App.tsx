import { useState } from 'react';
import { ScoreType } from './score';
import { ScoreNumericInput } from './score-input';

export const App = () => {
  const [score, onScoreChange] = useState<ScoreType>(0);

  return (
    <div>
      <ScoreNumericInput score={score} onScoreChange={onScoreChange} />
    </div>
  );
};
