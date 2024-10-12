import { Button } from '@blueprintjs/core';
import { ButtonNowrapStyled } from '../bp';
import { ButtonsWrapper } from '../styled';
import { BatchInputFormShared } from './batch-input-form-shared';

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
    const comment = useObservableValue(comment$);
    const selectedIconId = useObservableValue(selectedIconId$);
    const point = useObservableValue(fairPoint$);

    useEffect(() => {
      setDefaultFairPoint(answerIcons.fair.point);
    }, [answerIcons.fair.point]);

    const onApplyBatchInputClick = useCallback(() => {
      applyBatchInput({
        comment,
        selectedIconId,
        point,
      });
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
              <BatchInputFormShared
                answerIcons={answerIcons}
                comment={comment}
                point={point}
                selectedIconId={selectedIconId}
                setComment={setComment}
                setFairPoint={setFairPoint}
                onFairClick={onFairClick}
                onGoodClick={onGoodClick}
                onPoorClick={onPoorClick}
              />

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

const { state$: comment$, setState: setComment } = createState('');

const { state$: selectedIconId$, updateState: updateSelectedIconId } =
  createState<AnswerIconIdWithNone>('none');

const { state$: defaultFairPoint$, setState: setDefaultFairPoint } =
  createState<AnswerIconPoint>(0);

const { state$: fairPoint$, setState: setFairPoint } =
  createState<AnswerIconPoint>(0);

const onGoodClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'good' ? 'none' : 'good'));
};
const onFairClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'fair' ? 'none' : 'fair'));
  if (selectedIconId$.snapshot.value === 'fair') {
    setFairPoint(defaultFairPoint$.snapshot.value);
  }
};
const onPoorClick = (): void => {
  updateSelectedIconId((prev) => (prev === 'poor' ? 'none' : 'poor'));
};
