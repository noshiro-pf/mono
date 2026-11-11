import { Button, TextArea } from 'blueprint-synstate';
import { createState, map, type InitializedObservable } from 'synstate';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { dict } from '../../constants/index.mjs';
import { AnswerIconPointCell, CustomIconButton } from '../molecules/index.mjs';
import {
  answerCommentCellClass,
  answerInputTableClass,
  answerPointCellClass,
  borderedTableClass,
  ButtonsWrapper,
  nowrapClass,
} from '../styled/index.mjs';
import * as styles from './batch-input-field.module.css';

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  answerIcons: InitializedObservable<EventSchedule['answerIcons']>;
  toggleOpen: () => void;
  applyBatchInput: (
    result: Readonly<{
      comment: string;
      selectedIconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
    }>,
  ) => void;
}>;

const dc = dict.answerPage.answerBeingEdited;

export const BatchInputAnswerForm = ({
  isOpen,
  answerIcons,
  toggleOpen,
  applyBatchInput,
}: Props): JSX.Element => (
  <div>
    <ButtonsWrapper>
      <Button
        active={isOpen}
        icon={'edit'}
        intent={'success'}
        text={mapBindable(isOpen, (open) =>
          open ? dc.batchInput.closeButton : dc.batchInput.openButton,
        )}
        onClick={toggleOpen}
      />
    </ButtonsWrapper>
    <If
      cond={isOpen}
      then={
        <div>
          <div class={constant(styles.batchRow)}>
            <table
              class={constant(`${borderedTableClass} ${answerInputTableClass}`)}
            >
              <tbody>
                <tr>
                  {(['good', 'fair', 'poor'] as const).map((iconId) => (
                    <td>
                      <CustomIconButton
                        active={selectedIconId$.pipe(map((s) => s === iconId))}
                        iconColor={selectedIconId$.pipe(
                          map((s) => (s === iconId ? 'blue' : 'gray')),
                        )}
                        iconName={iconId}
                        title={answerIcons.pipe(
                          map((a) => a[iconId].description),
                        )}
                        onClick={() => {
                          onIconClick(
                            iconId,
                            Optional.unwrap(answerIcons.getSnapshot()).fair
                              .point,
                          );
                        }}
                      />
                    </td>
                  ))}
                  <td class={constant(answerPointCellClass)}>
                    <AnswerIconPointCell
                      iconId={selectedIconId$}
                      point={fairPoint$}
                      onPointChange={setFairPoint}
                    />
                  </td>
                  <td>
                    <TextArea
                      class={answerCommentCellClass}
                      rows={1}
                      value={comment$}
                      onInput={({ currentTarget }) => {
                        setComment(currentTarget.value);
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div>
              <Button
                class={nowrapClass}
                icon={'tick'}
                intent={'none'}
                text={constant(dc.batchInput.apply)}
                onClick={() => {
                  applyBatchInput({
                    comment: Optional.unwrap(comment$.getSnapshot()),
                    selectedIconId: Optional.unwrap(
                      selectedIconId$.getSnapshot(),
                    ),
                    point: Optional.unwrap(fairPoint$.getSnapshot()),
                  });
                }}
              />
            </div>
          </div>
        </div>
      }
    />
  </div>
);

// Kept for the page's lifetime, as the batch input was.
const [comment$, setComment] = createState('');

const [selectedIconId$, , { updateState: updateSelectedIconId }] =
  createState<AnswerIconIdWithNone>('none');

const [fairPoint$, setFairPoint] = createState<AnswerIconPoint>(0);

/** Flips the icon; fair starts from the point the event gives it. */
const onIconClick = (
  iconId: AnswerIconId,
  defaultFairPoint: AnswerIconPoint,
): void => {
  const next = updateSelectedIconId((prev) =>
    prev === iconId ? 'none' : iconId,
  );

  if (next === 'fair') {
    setFairPoint(defaultFairPoint);
  }
};
