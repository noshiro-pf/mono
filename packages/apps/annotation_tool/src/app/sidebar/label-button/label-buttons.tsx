import { Button, Collapse } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { Percent } from '@noshiro/ts-utils';
import { tuple } from '@noshiro/ts-utils';
import { useMemo } from 'react';
import styled from 'styled-components';
import type { Label } from '../../../canvas';
import type { AppEventHandler } from '../../event-handlers';
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
        tuple(label, props.visibleLabels.includes(label))
      ),
    [props.labels, props.visibleLabels]
  );

  return (
    <Root>
      <Title>
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
      </Title>

      <Collapse isOpen={!props.hidden}>
        <LabelsWrapper>
          {labelsWithVisibleFlag.map(([label, isVisible], index) => (
            <LabelButtonItem
              index={index}
              key={label.id}
              label={label}
              labelsSaturation={props.labelSaturation}
              labelsLightness={props.labelLightness}
              isSelected={label === props.selectedLabel}
              isVisible={isVisible}
              handlers={props.handlers}
            />
          ))}
        </LabelsWrapper>
      </Collapse>
    </Root>
  );
});

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-touch-callout: none;
`;

const Title = styled.div`
  flex-grow: 0;
  padding: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

// const Content = styled.div`
//   flex-grow: 1;
//   display: flex;
//   flex-direction: column;
// `;

const LabelsWrapper = styled.div`
  overflow-y: auto;
`;
