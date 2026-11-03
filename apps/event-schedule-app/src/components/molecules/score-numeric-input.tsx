import { constant, type Bindable, type JSX } from 'synstate-dom';
import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../constants/index.mjs';
import type { AnswersScore } from '../../types/index.mjs';
import { AppNumericInput } from './app-numeric-input.js';

type Props = Readonly<{
  score: Bindable<AnswersScore>;
  onScoreChange: (value: AnswersScore) => void;
  disabled?: Bindable<boolean>;
  min?: Bindable<AnswersScore>;
  max?: Bindable<AnswersScore>;
}>;

const { majorStep: step } = answersScoreNumericInputConfig;

export const ScoreNumericInput = ({
  score,
  disabled,
  min = constant(answersScoreNumericInputConfig.min),
  max = constant(answersScoreNumericInputConfig.max),
  onScoreChange,
}: Props): JSX.Element => (
  <AppNumericInput
    disabled={disabled}
    max={max}
    min={min}
    normalize={clampAndRoundAnswersScore}
    step={step}
    value={score}
    onValueChange={onScoreChange}
  />
);
