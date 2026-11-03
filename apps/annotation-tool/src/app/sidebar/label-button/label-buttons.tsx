import { Button, Collapse } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import type { Percent } from 'ts-type-forge';
import type { Label } from '../../../canvas/index.mjs';
import type { AppEventHandler } from '../../../types/index.mjs';
import { LabelButtonItem } from './label-button-item.js';
import * as styles from './label-buttons.module.css';

type Props = Readonly<{
  labels: readonly Label[];
  labelSaturation: Percent;
  labelLightness: Percent;
  /** Whether each label of `labels` is shown, by index. */
  visibleLabelFlags: Bindable<readonly boolean[]>;
  selectedLabel: Bindable<Label>;
  hidden: Bindable<boolean>;
  handlers: AppEventHandler;
}>;

export const LabelButtons = (props: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div class={constant(styles.header)}>
      {constant('Labels')}
      <Button
        aria-controls={constant(labelListId)}
        aria-expanded={mapBindable(props.hidden, (hidden) =>
          hidden ? 'false' : 'true',
        )}
        aria-label={constant('Labels')}
        icon={mapBindable(props.hidden, (hidden) =>
          hidden ? 'double-chevron-down' : 'double-chevron-up',
        )}
        onClick={props.handlers.toggleLabelList}
      />
    </div>

    <Collapse
      isOpen={mapBindable(props.hidden, (hidden) => !hidden)}
      keepChildrenMounted
    >
      <div
        class={constant(styles.list)}
        data-e2e={constant('label-list')}
        id={constant(labelListId)}
      >
        {props.labels.map((label, index) => (
          <LabelButtonItem
            handlers={props.handlers}
            isSelected={mapBindable(
              props.selectedLabel,
              (selected) => selected === label,
            )}
            isVisible={mapBindable(
              props.visibleLabelFlags,
              (flags) => flags[index] === true,
            )}
            label={label}
            labelsLightness={props.labelLightness}
            labelsSaturation={props.labelSaturation}
          />
        ))}
      </div>
    </Collapse>
  </div>
);

/** The one label list on the page, which the header's button controls. */
const labelListId = 'label-list';
