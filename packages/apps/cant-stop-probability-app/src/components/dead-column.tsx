import { ButtonGroup } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { type TwoDiceSumValue } from '../types';

type Props = DeepReadonly<{
  columnsAliveWithHandler: {
    columnId: TwoDiceSumValue;
    alive: boolean;
    toggle: () => void;
  }[];
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
            active={!alive}
            nowrap={true}
            onClick={toggle}
          >
            {alive ? (
              <span>{columnId}</span>
            ) : (
              <span
                css={css`
                  text-decoration: line-through;
                `}
              >
                {columnId}
              </span>
            )}
          </BpButton>
        ))}
      </ButtonGroup>
      <div
        css={css`
          padding: 10px;
        `}
      >
        {'確率： '}
        {hitSomeAliveColumnProbability}
      </div>
    </div>
  )
);
