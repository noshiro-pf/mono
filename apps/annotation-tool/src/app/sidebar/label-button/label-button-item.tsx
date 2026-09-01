import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type SafeUint } from 'ts-data-forge';
import { type Percent } from 'ts-type-forge';
import { type Hsl } from 'ts-utils-additional';
import { type Label } from '../../../canvas/index.mjs';
import { type AppEventHandler } from '../../../types/index.mjs';
import { LabelButtonItemView } from './label-button-item-view.js';

type Props = Readonly<{
  index: SafeUint;
  label: Label;
  labelsSaturation: Percent;
  labelsLightness: Percent;
  isSelected: boolean;
  isVisible: boolean;
  handlers: AppEventHandler;
}>;

export const LabelButtonItem = memoNamed<Props>('LabelButtonItem', (props) => {
  const hsl = React.useMemo<Hsl>(
    () => [props.label.hue, props.labelsSaturation, props.labelsLightness],
    [props.label.hue, props.labelsSaturation, props.labelsLightness],
  );

  const onLabelClick = React.useCallback(() => {
    props.handlers.selectLabel(props.label.id);
  }, [props.label.id, props.handlers]);

  const onVisibilityIconClick = React.useCallback(
    (ev: Readonly<React.BaseSyntheticEvent>) => {
      props.handlers.flipLabelVisibility(props.label.id);

      ev.stopPropagation();
    },
    [props.label.id, props.handlers],
  );

  return (
    <LabelButtonItemView
      hsl={hsl}
      index={props.index}
      isSelected={props.isSelected}
      isVisible={props.isVisible}
      labelText={props.label.name}
      onLabelClick={onLabelClick}
      onVisibilityIconClick={onVisibilityIconClick}
    />
  );
});
