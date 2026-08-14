import { Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import * as React from 'react';
import {
  BpTextArea,
  ButtonNowrapStyled,
  HTMLTableBorderedStyled2,
} from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { createState as createStateBase } from 'synstate';
import { createState } from 'synstate-react-hooks';
import { type DeepReadonly } from 'ts-type-forge';
import { match } from '../../utils-ported/index.mjs';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
  CustomIconButton,
} from '../molecules/index.mjs';
import { ButtonsWrapper } from '../styled/index.mjs';

type Props = DeepReadonly<{
  isOpen: boolean;
  answerIcons: EventSchedule['answerIcons'];
  toggleOpen: () => void;
  applyBatchInput: (
    result: Readonly<{
      comment: string;
      selectedIconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
    }>,
  ) => void;
}>;

export const BatchInputAnswerForm = memoNamed<Props>(
  'BatchInputAnswerForm',
  ({ isOpen, answerIcons, toggleOpen, applyBatchInput }) => {
    const comment = useComment();

    const selectedIconId = useSelectedIconId();

    const point = useFairPoint();

    React.useEffect(() => {
      setDefaultFairPoint(answerIcons.fair.point);
    }, [answerIcons.fair.point]);

    const onApplyBatchInputClick = React.useCallback(() => {
      applyBatchInput({ comment, selectedIconId, point });
    }, [applyBatchInput, comment, point, selectedIconId]);

    return (
      <div>
        <ButtonsWrapper>
          <Button
            active={isOpen}
            icon={'edit'}
            intent={'success'}
            onClick={toggleOpen}
          >
            {isOpen ? dc.batchInput.closeButton : dc.batchInput.openButton}
          </Button>
        </ButtonsWrapper>
        {isOpen ? (
          <div>
            <div
              css={css`
                margin: 5px;
                display: flex;
                align-items: center;
              `}
            >
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
                        title={answerIcons.good.description}
                        onClick={onGoodClick}
                      />
                    </td>
                    <td>
                      <CustomIconButton
                        active={selectedIconId === 'fair'}
                        iconColor={selectedIconId === 'fair' ? 'blue' : 'gray'}
                        iconName={'fair'}
                        title={answerIcons.fair.description}
                        onClick={onFairClick}
                      />
                    </td>
                    <td>
                      <CustomIconButton
                        active={selectedIconId === 'poor'}
                        iconColor={selectedIconId === 'poor' ? 'blue' : 'gray'}
                        iconName={'poor'}
                        title={answerIcons.poor.description}
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

              <div>
                <ButtonNowrapStyled
                  icon={'tick'}
                  intent={'none'}
                  onClick={onApplyBatchInputClick}
                >
                  {dc.batchInput.apply}
                </ButtonNowrapStyled>
              </div>
            </div>
          </div>
        ) : undefined}
      </div>
    );
  },
);

const dc = dict.answerPage.answerBeingEdited;

const [useComment, setComment] = createState('');

const [
  useSelectedIconId,
  ,
  { updateState: updateSelectedIconId, getSnapshot: getSelectedIconIdSnapshot },
] = createState<AnswerIconIdWithNone>('none');

const [, setDefaultFairPoint, { getSnapshot: getDefaultFairPointSnapshot }] =
  createStateBase<AnswerIconPoint>(0);

const [useFairPoint, setFairPoint] = createState<AnswerIconPoint>(0);

const onGoodClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'good' ? 'none' : 'good'));
};

const onFairClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'fair' ? 'none' : 'fair'));

  if (getSelectedIconIdSnapshot() === 'fair') {
    setFairPoint(getDefaultFairPointSnapshot());
  }
};

const onPoorClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'poor' ? 'none' : 'poor'));
};
