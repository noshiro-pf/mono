import { memoNamed } from '@noshiro/react-utils';
import type { Hsl, Percent } from '@noshiro/ts-utils';
import type { BaseSyntheticEvent } from 'react';
import { useCallback, useMemo } from 'react';
import type { Label } from '../../../canvas';
import type { AppEventHandler } from '../../event-handlers';
import { LabelButtonItemView } from './label-button-item-view';

type Props = Readonly<{
  index: number;
  label: Label;
  labelsSaturation: Percent;
  labelsLightness: Percent;
  isSelected: boolean;
  isVisible: boolean;
  handlers: AppEventHandler;
}>;

export const LabelButtonItem = memoNamed<Props>('LabelButtonItem', (props) => {
  const hsl = useMemo<Hsl>(
    () => [props.label.hue, props.labelsSaturation, props.labelsLightness],
    [props.label.hue, props.labelsSaturation, props.labelsLightness]
  );

  const onLabelClick = useCallback(() => {
    props.handlers.selectLabel(props.label.id);
  }, [props.label.id, props.handlers]);

  const onVisibilityIconClick = useCallback(
    (ev: BaseSyntheticEvent) => {
      props.handlers.flipLabelVisibility(props.label.id);
      ev.stopPropagation();
    },
    [props.label.id, props.handlers]
  );

  return (
    <LabelButtonItemView
      index={props.index}
      hsl={hsl}
      isSelected={props.isSelected}
      labelText={props.label.name}
      isVisible={props.isVisible}
      onLabelClick={onLabelClick}
      onVisibilityIconClick={onVisibilityIconClick}
    />
  );
});
