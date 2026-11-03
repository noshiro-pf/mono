import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { AnswerIconFairPointInput } from './fair-point-input.js';
import { AnswerIconGoodPoint } from './good-point.js';
import { AnswerIconPoorPoint } from './poor-point.js';

type Props = Readonly<{
  iconId: Bindable<AnswerIconIdWithNone>;
  point: Bindable<AnswerIconPoint>;
  onPointChange: (point: AnswerIconPoint) => void;
}>;

/** The point an icon is worth: fixed for good and poor, set for fair. */
export const AnswerIconPointCell = ({
  iconId,
  point,
  onPointChange,
}: Props): JSX.Element => {
  const is = (id: AnswerIconIdWithNone): Bindable<boolean> =>
    mapBindable(iconId, (i) => i === id);

  return (
    <>
      <If cond={is('good')} then={<AnswerIconGoodPoint />} />
      <If cond={is('poor')} then={<AnswerIconPoorPoint />} />
      <If
        cond={is('fair')}
        then={
          <AnswerIconFairPointInput
            disabled={constant(false)}
            value={point}
            onValueChange={onPointChange}
          />
        }
      />
    </>
  );
};
