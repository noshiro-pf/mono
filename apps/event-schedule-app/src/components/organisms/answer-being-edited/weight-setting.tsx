import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { WeightNumericInput } from '../../molecules/index.mjs';
import * as styles from './answer-being-edited.module.css';

const dc = dict.answerPage.answerBeingEdited;

export type WeightSettingProps = Readonly<{
  weight: Bindable<Weight>;
  onWeightChange: (v: Weight) => void;
}>;

export const WeightSetting = ({
  weight,
  onWeightChange,
}: WeightSettingProps): JSX.Element => (
  <div class={constant(styles.weightSetting)}>
    <div class={constant(styles.weightInput)}>
      <WeightNumericInput weight={weight} onWeightChange={onWeightChange} />
    </div>
    <div class={constant(styles.weightSuffix)}>
      {constant(dc.weight.suffix)}
    </div>
  </div>
);
