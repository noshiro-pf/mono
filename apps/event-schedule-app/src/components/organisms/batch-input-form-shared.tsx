import { css } from '@emotion/react';
import { BpTextArea, HTMLTableBorderedStyled2 } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { match } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
  CustomIconButton,
} from '../molecules/index.mjs';

type Props = DeepReadonly<{
  selectedIconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
  comment: string;
  setComment: (value: string) => void;
  onGoodClick: () => void;
  onFairClick: () => void;
  onPoorClick: () => void;
  setFairPoint: (value: AnswerIconPoint) => void;
  answerIcons?: EventSchedule['answerIcons'];
}>;

/**
 * The icon, point and comment fields of a batch input, without the state they
 * are held in: the answer page's form and the batch update page share it.
 */
export const BatchInputFormShared = memoNamed<Props>(
  'BatchInputFormShared',
  ({
    selectedIconId,
    point,
    comment,
    setComment,
    onGoodClick,
    onFairClick,
    onPoorClick,
    setFairPoint,
    answerIcons,
  }) => (
    <HTMLTableBorderedStyled2
      css={css`
        th,
        td {
          padding: 6px;
        }
      `}
    >
      <tbody>
        <tr>
          <td>
            <CustomIconButton
              active={selectedIconId === 'good'}
              iconColor={selectedIconId === 'good' ? 'blue' : 'gray'}
              iconName={'good'}
              title={answerIcons?.good.description ?? ''}
              onClick={onGoodClick}
            />
          </td>
          <td>
            <CustomIconButton
              active={selectedIconId === 'fair'}
              iconColor={selectedIconId === 'fair' ? 'blue' : 'gray'}
              iconName={'fair'}
              title={answerIcons?.fair.description ?? ''}
              onClick={onFairClick}
            />
          </td>
          <td>
            <CustomIconButton
              active={selectedIconId === 'poor'}
              iconColor={selectedIconId === 'poor' ? 'blue' : 'gray'}
              iconName={'poor'}
              title={answerIcons?.poor.description ?? ''}
              onClick={onPoorClick}
            />
          </td>
          <td
            css={css`
              min-width: 87px;
              max-width: 87px;
            `}
          >
            {match(selectedIconId, {
              none: undefined,
              good: <AnswerIconGoodPoint />,
              poor: <AnswerIconPoorPoint />,
              fair: (
                <AnswerIconFairPointInput
                  disabled={false}
                  value={point}
                  onValueChange={setFairPoint}
                />
              ),
            })}
          </td>
          <td>
            <BpTextArea
              css={css`
                resize: vertical;
                min-height: 38px;
              `}
              rows={1}
              value={comment}
              onValueChange={setComment}
            />
          </td>
        </tr>
      </tbody>
    </HTMLTableBorderedStyled2>
  ),
);
