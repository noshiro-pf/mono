import { ButtonGroup } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import type { TwoDiceSumValue } from '../types';

type Props = Readonly<{
  columnsAliveWithHandler: readonly Readonly<{
    columnId: TwoDiceSumValue;
    alive: boolean;
    toggle: () => void;
  }>[];
  hitSomeAliveColumnProbability: number;
}>;

export const DeadColumn = memoNamed<Props>(
  'DeadColumn',
  ({ columnsAliveWithHandler, hitSomeAliveColumnProbability }) => (
    <div>
      <ButtonGroup>
        {columnsAliveWithHandler.map(({ columnId, alive, toggle }) => (
          <BpButton
            key={columnId}
            nowrap={true}
            active={!alive}
            onClick={toggle}
          >
            {alive ? (
              <span>{columnId}</span>
            ) : (
              <LineThrough>{columnId}</LineThrough>
            )}
          </BpButton>
        ))}
      </ButtonGroup>
      <ProbabilityText>確率： {hitSomeAliveColumnProbability}</ProbabilityText>
    </div>
  )
);

const LineThrough = styled.span`
  text-decoration: line-through;
`;

const ProbabilityText = styled.div`
  padding: 10px;
`;
