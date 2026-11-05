import { constant, type Bindable, type JSX } from 'synstate-dom';
import {
  answerRankNumericInputConfig,
  clampAndRoundAnswerRank,
} from '../../constants/index.mjs';
import type { AnswerRank } from '../../types/index.mjs';
import { AppNumericInput } from './app-numeric-input.js';

type Props = Readonly<{
  value: Bindable<AnswerRank>;
  onValueChange: (value: AnswerRank) => void;
  disabled?: Bindable<boolean>;
}>;

const { majorStep: step, min, max } = answerRankNumericInputConfig;

export const RankNumericInput = ({
  value,
  disabled,
  onValueChange,
}: Props): JSX.Element => (
  <AppNumericInput
    disabled={disabled}
    max={constant(max)}
    min={constant(min)}
    normalize={clampAndRoundAnswerRank}
    step={step}
    value={value}
    onValueChange={onValueChange}
  />
);
