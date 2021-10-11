import { memoNamed } from '@noshiro/react-utils';
import { defaultSymbolPoint } from '../../../constants';
import { NumericInputView } from '../../bp';

const s = defaultSymbolPoint.poor.toString();

export const AnswerSymbolPoorPointInputDisabled = memoNamed(
  'AnswerSymbolPoorPointInputDisabled',
  () => <NumericInputView disabled={true} fillSpace={true} valueAsStr={s} />
);
