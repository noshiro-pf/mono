import { Button } from '@blueprintjs/core';
import {
  BpTextArea,
  ButtonNowrapStyled,
  CustomIconButton,
  HTMLTableBorderedStyled2,
} from '../bp';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
} from '../molecules';
import { ButtonsWrapper } from '../styled';

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

const { useCurrentValue: useComment, setState: setComment } = createState('');

const {
  useCurrentValue: useSelectedIconId,
  state: selectedIconId$,
  updateState: updateSelectedIconId,
} = createState<AnswerIconIdWithNone>('none');

const { state: defaultFairPoint$, setState: setDefaultFairPoint } =
  createState<AnswerIconPoint>(0);

const { useCurrentValue: useFairPoint, setState: setFairPoint } =
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
