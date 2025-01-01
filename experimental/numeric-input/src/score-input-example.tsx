import * as React from 'react';
import { ScoreNumericInput } from './score-input';
import { ScoreType } from './score-type';

export const ScoreInputExample = () => {
  const [score, setScore] = React.useState<ScoreType>(0);

  console.log({ score });

  return (
    <div>
      <ScoreNumericInput score={score} onScoreChange={setScore} />
      <div>{score}</div>
    </div>
  );
};
