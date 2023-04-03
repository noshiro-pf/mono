import { Button, Collapse } from '@blueprintjs/core';
import { type Label } from '../../../canvas';
import { type AppEventHandler } from '../../../types';
import { LabelButtonItem } from './label-button-item';

type Props = Readonly<{
  labels: readonly Label[];
  labelSaturation: Percent;
  labelLightness: Percent;
  visibleLabels: readonly Label[];
  selectedLabel: Label;
  hidden: boolean;
  handlers: AppEventHandler;
}>;

export const LabelButtons = memoNamed<Props>('LabelButtons', (props) => {
  const labelsWithVisibleFlag = useMemo(
    () =>
      props.labels.map((label) =>
        tp(label, props.visibleLabels.includes(label))
      ),
    [props.labels, props.visibleLabels]
  );

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        user-select: none;
        -webkit-touch-callout: none;
      `}
    >
      <div
        css={css`
          flex-grow: 0;
          padding: 10px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        `}
      >
        {'Labels'}
        {props.hidden ? (
          <Button
            icon={'double-chevron-down'}
            onClick={props.handlers.expandLabelList}
          />
        ) : (
          <Button
            icon={'double-chevron-up'}
            onClick={props.handlers.collapseLabelList}
          />
        )}
      </div>

      <Collapse isOpen={!props.hidden}>
        <div
          css={css`
            overflow-y: auto;
          `}
        >
          {labelsWithVisibleFlag.map(([label, isVisible], index) => (
            <LabelButtonItem
              key={label.id}
              handlers={props.handlers}
              index={index}
              isSelected={label === props.selectedLabel}
              isVisible={isVisible}
              label={label}
              labelsLightness={props.labelLightness}
              labelsSaturation={props.labelSaturation}
            />
          ))}
        </div>
      </Collapse>
    </div>
  );
});
