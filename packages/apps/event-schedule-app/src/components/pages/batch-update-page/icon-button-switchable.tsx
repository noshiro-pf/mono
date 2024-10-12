import { Button } from '@blueprintjs/core';
import { CustomIcon } from '../../atoms';
import { editingModeTextColor } from './color';

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

export const CustomIconReadonlyOrButton = memoNamed<Props>(
  'CustomIconReadonlyOrButton',
  ({ mode, editable, iconId, showPoint, point, weight, onClick }) => (
    <>
      {mode === 'button' ? (
        <Button
          icon={<CustomIcon color={'gray'} iconName={iconId} />}
          minimal={true}
          onClick={onClick}
        />
      ) : (
        <CustomIcon
          color={!editable ? editingModeTextColor : 'black'}
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
  ),
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
