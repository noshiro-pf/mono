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

  // One pill in the label's colour, holding two buttons side by side: the
  // label's, and the eye's, since a button inside a button is invalid.
  return (
    <div
      class={constant(styles.item)}
      style={{
        'background-color': constant(color),
        color: constant(contrastColor),
      }}
    >
      <button
        aria-pressed={mapBindable(isSelected, (selected) =>
          selected ? 'true' : 'false',
        )}
        class={constant(styles.button)}
        data-e2e={constant('label-button')}
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
      </button>
      <button
        aria-label={constant(`Show ${label.name}`)}
        aria-pressed={mapBindable(isVisible, (visible) =>
          visible ? 'true' : 'false',
        )}
        class={constant(styles.visibilityToggle)}
        data-e2e={constant('visibility-toggle')}
        type={constant('button')}
        onClick={() => {
          handlers.flipLabelVisibility(label.id);
        }}
      >
        <Icon
          icon={mapBindable(isVisible, (visible) =>
            visible ? 'eye-open' : 'eye-off',
          )}
          size={20}
        />
      </button>
    </div>
  );
};
