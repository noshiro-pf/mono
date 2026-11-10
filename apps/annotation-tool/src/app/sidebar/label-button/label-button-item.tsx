import { Icon } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import type { Percent } from 'ts-type-forge';
import {
  higherContrastTextColorHsl,
  hslToStr,
  type Hsl,
} from 'ts-utils-additional';
import type { Label } from '../../../canvas/index.mjs';
import type { AppEventHandler } from '../../../types/index.mjs';
import * as styles from './label-button-item.module.css';

type Props = Readonly<{
  label: Label;
  labelsSaturation: Percent;
  labelsLightness: Percent;
  isSelected: Bindable<boolean>;
  isVisible: Bindable<boolean>;
  handlers: AppEventHandler;
}>;

/**
 * A label's button, in the label's colour: pressed while the label is the one
 * new boxes are drawn in, with a tick, and an eye that shows or hides it.
 */
export const LabelButtonItem = ({
  label,
  labelsSaturation,
  labelsLightness,
  isSelected,
  isVisible,
  handlers,
}: Props): JSX.Element => {
  const hsl: Hsl = [label.hue, labelsSaturation, labelsLightness] as const;

  const color = hslToStr(hsl);

  const contrastColor = higherContrastTextColorHsl(hsl);

  return (
    <div class={constant(styles.item)}>
      <button
        aria-pressed={mapBindable(isSelected, (selected) =>
          selected ? 'true' : 'false',
        )}
        class={constant(styles.button)}
        style={{
          'background-color': constant(color),
          color: constant(contrastColor),
        }}
        type={constant('button')}
        onClick={() => {
          handlers.selectLabel(label.id);
        }}
      >
        {/* Drawn in the button's own colour, and so unseen, until selected. */}
        <Icon
          icon={'tick'}
          style={mapBindable(
            isSelected,
            (selected) => `color: ${selected ? contrastColor : color}`,
          )}
        />
        <div class={constant(styles.text)}>{constant(label.name)}</div>
        {/* eslint-disable-next-line synstate-dom-a11y/click-events-have-key-events, synstate-dom-a11y/no-static-element-interactions -- reached by pointer only, as before the move to synstate-dom: a button here would be one inside another */}
        <div
          class={constant(styles.visibilityToggle)}
          data-e2e={constant('visibility-toggle')}
          onClick={(event) => {
            handlers.flipLabelVisibility(label.id);

            // Not a click on the label's button as well.
            event.stopPropagation();
          }}
        >
          <Icon
            icon={mapBindable(isVisible, (visible) =>
              visible ? 'eye-open' : 'eye-off',
            )}
            size={20}
          />
        </div>
      </button>
    </div>
  );
};
