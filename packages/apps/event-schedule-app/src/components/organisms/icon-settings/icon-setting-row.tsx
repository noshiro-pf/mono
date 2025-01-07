import { BpInput } from '@noshiro/react-blueprintjs-utils';
import { CustomIcon } from '../../atoms';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
} from '../../molecules';

type Props = Readonly<{
  iconId: AnswerIconId;
  answerIcon: AnswerIconSetting;
  onDescriptionChange: (value: string) => void;
  onPointChange: (value: AnswerIconPoint) => void;
}>;

export const AnswerIconRow = memoNamed<Props>(
  'AnswerIconRow',
  ({ iconId, answerIcon, onDescriptionChange, onPointChange }) => (
    <div
      css={css`
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        margin-bottom: 5px;
        justify-content: flex-start;

        & > * {
          margin-right: 3px;
        }
      `}
    >
      <div
        css={css`
          flex: 0;
          padding: 0 5px;
        `}
      >
        <CustomIcon iconName={iconId} />
      </div>
      <div
        css={css`
          flex: 2 2;
          min-width: 92px;
          max-width: 300px;
        `}
      >
        <BpInput
          value={answerIcon.description}
          onValueChange={onDescriptionChange}
        />
      </div>
      <div
        css={css`
          flex: 0 0 75px;
        `}
      >
        {match(iconId, {
          good: <AnswerIconGoodPoint />,
          poor: <AnswerIconPoorPoint />,
          fair: (
            <div data-cy={'fair-point-input'}>
              <AnswerIconFairPointInput
                disabled={false}
                value={answerIcon.point}
                onValueChange={onPointChange}
              />
            </div>
          ),
        })}
      </div>
    </div>
  ),
);
