import * as React from 'react';
import { ScoreType } from './score';
import { ScoreNumericInput } from './score-input';

export const App = React.memo(() => {
  const [score, onScoreChange] = React.useState<ScoreType>(0);

  return (
    <div>
      <ScoreNumericInput score={score} onScoreChange={onScoreChange} />
    </div>
  );
});
