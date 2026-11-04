import { Button } from '@blueprintjs/core';
import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { dict } from '../../../constants/index.mjs';
import { CustomIcon } from '../../atoms/index.mjs';
import { editingModeTextColor } from './color.mjs';

type Props = Readonly<{
  mode: 'button' | 'readonly';
  editable: boolean;
  iconId: AnswerIconIdWithNone;
  showPoint: boolean;
  point: AnswerIconPoint;
  weight: Weight;
  onClick: () => void;
}>;

const dc = dict.batchUpdatePage;

/** An answer's icon: a button while editing, the icon alone otherwise. */
export const CustomIconReadonlyOrButton = memoNamed<Props>(
  'CustomIconReadonlyOrButton',
  ({ mode, editable, iconId, showPoint, point, weight, onClick }) => {
    const buttonIcon = React.useMemo(
      () => <CustomIcon color={'gray'} iconName={iconId} />,
      [iconId],
    );

    return (
      <>
        {mode === 'button' ? (
          <Button icon={buttonIcon} variant={'minimal'} onClick={onClick} />
        ) : (
          <CustomIcon
            color={editable ? 'black' : editingModeTextColor}
            iconName={iconId}
          />
        )}

        {showPoint ? (
          <CustomPointValue>
            {`${dict.common.brace.start}${point}${dict.common.brace.end}`}
          </CustomPointValue>
        ) : undefined}

        {weight === 1 ? undefined : (
          <WeightValue>
            <WeightTimes>{dc.times}</WeightTimes>
            <div>{weight}</div>
          </WeightValue>
        )}
      </>
    );
  },
);

const CustomPointValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;

  &.readonly {
    color: ${editingModeTextColor};
  }
`;

const WeightValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;

  &.readonly {
    color: ${editingModeTextColor};
  }
`;

const WeightTimes = styled.span`
  margin: 0 1px;
`;
