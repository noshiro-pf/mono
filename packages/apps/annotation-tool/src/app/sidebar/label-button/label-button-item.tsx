import { type Hsl, type Percent } from '@noshiro/ts-utils-additional';
import { type Label } from '../../../canvas';
import { type AppEventHandler } from '../../../types';
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
    (ev: React.BaseSyntheticEvent) => {
      props.handlers.flipLabelVisibility(props.label.id);
      ev.stopPropagation();
    },
    [props.label.id, props.handlers]
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
