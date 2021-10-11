import { memoNamed } from '@noshiro/react-utils';
import { defaultSymbolPoint } from '../../../constants';
import { NumericInputView } from '../../bp';

const s = defaultSymbolPoint.good.toString();

export const AnswerSymbolGoodPointInputDisabled = memoNamed(
  'AnswerSymbolGoodPointInputDisabled',
  () => <NumericInputView disabled={true} fillSpace={true} valueAsStr={s} />
);
