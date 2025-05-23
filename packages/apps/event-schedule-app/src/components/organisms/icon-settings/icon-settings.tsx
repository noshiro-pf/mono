import {
  iconListReducer,
  type IconListReducerAction,
} from '../../../functions';
import { Description } from '../../atoms';
import { AnswerIconRow } from './icon-setting-row';

const dc = dict.eventSettingsPage.section3.iconSettings;

type Props = Readonly<{
  answerIcons: AnswerIconSettings;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
}>;

export const AnswerIconSettingsComponent = memoNamed<Props>(
  'AnswerIconSettings',
  ({ answerIcons, onAnswerIconsChange }) => {
    const dispatch = useCallback(
      (action: IconListReducerAction) => {
        onAnswerIconsChange(iconListReducer(answerIcons, action));
      },
      [answerIcons, onAnswerIconsChange],
    );

    const onOkDescriptionChange = useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'good', description });
      },
      [dispatch],
    );

    const onNeitherDescriptionChange = useCallback(
      (description: string) => {
        dispatch({
          type: 'update-description',
          iconId: 'fair',
          description,
        });
      },
      [dispatch],
    );

    const onNeitherPointChange = useCallback(
      (point: AnswerIconPoint) => {
        dispatch({ type: 'update-point', iconId: 'fair', point });
      },
      [dispatch],
    );

    const onNgDescriptionChange = useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'poor', description });
      },
      [dispatch],
    );

    return (
      <div
        css={css`
          & > * {
            margin-bottom: 5px;
          }
        `}
        data-e2e={'icon-settings'}
      >
        <div>{dc.title}</div>
        <Description text={dc.description} />
        <AnswerIconRow
          answerIcon={answerIcons.good}
          iconId={'good'}
          onDescriptionChange={onOkDescriptionChange}
          onPointChange={noop}
        />
        <AnswerIconRow
          answerIcon={answerIcons.fair}
          iconId={'fair'}
          onDescriptionChange={onNeitherDescriptionChange}
          onPointChange={onNeitherPointChange}
        />
        <AnswerIconRow
          answerIcon={answerIcons.poor}
          iconId={'poor'}
          onDescriptionChange={onNgDescriptionChange}
          onPointChange={noop}
        />
      </div>
    );
  },
);
