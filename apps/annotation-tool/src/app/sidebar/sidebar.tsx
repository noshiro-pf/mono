import { constant, type Bindable, type JSX } from 'synstate-dom';
import type { Percent } from 'ts-type-forge';
import type { Label } from '../../canvas/index.mjs';
import type { AppEventHandler } from '../../types/index.mjs';
import { LabelButtons } from './label-button/index.mjs';
import * as styles from './sidebar.module.css';

type Props = Readonly<{
  labels: readonly Label[];
  labelsSaturation: Percent;
  labelsLightness: Percent;
  /** Whether each label of `labels` is shown, by index. */
  visibleLabelFlags: Bindable<readonly boolean[]>;
  selectedLabel: Bindable<Label>;
  hidden: Bindable<boolean>;
  handlers: AppEventHandler;
}>;

export const Sidebar = (props: Props): JSX.Element => (
  <div class={constant(styles.sidebar)}>
    <LabelButtons
      handlers={props.handlers}
      hidden={props.hidden}
      labelLightness={props.labelsLightness}
      labelSaturation={props.labelsSaturation}
      labels={props.labels}
      selectedLabel={props.selectedLabel}
      visibleLabelFlags={props.visibleLabelFlags}
    />
  </div>
);
