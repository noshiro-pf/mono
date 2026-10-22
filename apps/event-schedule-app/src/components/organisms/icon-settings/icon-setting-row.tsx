import { css } from '@emotion/react';
import { BpInput } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { CustomIcon } from '../../atoms/index.mjs';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
} from '../../molecules/index.mjs';

type Props = Readonly<
  {
    answerIcon: AnswerIconSetting;
    onDescriptionChange: (value: string) => void;
  } & (
    | {
        iconId: 'fair';
        onPointChange: (value: AnswerIconPoint) => void;
      }
    | {
        // good と poor の点数は固定なので変更ハンドラを持たない
        iconId: 'good' | 'poor';
        onPointChange?: undefined;
      }
  )
>;

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
        {iconId === 'fair' ? (
          <div data-e2e={'fair-point-input'}>
            <AnswerIconFairPointInput
              disabled={false}
              value={answerIcon.point}
              onValueChange={onPointChange}
            />
          </div>
        ) : iconId === 'good' ? (
          <AnswerIconGoodPoint />
        ) : (
          <AnswerIconPoorPoint />
        )}
      </div>
    </div>
  ),
);
