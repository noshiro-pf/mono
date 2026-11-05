import {
  constant,
  toObservable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import {
  iconListReducer,
  type IconListReducerAction,
} from '../../../functions/index.mjs';
import { Description } from '../../atoms/index.mjs';
import { AnswerIconRow } from './icon-setting-row.js';
import * as styles from './icon-settings.module.css';

const dc = dict.eventSettingsPage.section3.iconSettings;

type Props = Readonly<{
  answerIcons: Bindable<AnswerIconSettings>;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
}>;

export const AnswerIconSettingsComponent = ({
  answerIcons,
  onAnswerIconsChange,
}: Props): JSX.Element => {
  const answerIcons$ = toObservable(answerIcons);

  const dispatch = (action: IconListReducerAction): void => {
    onAnswerIconsChange(
      iconListReducer(answerIcons$.getSnapshot().value, action),
    );
  };

  const onDescriptionChange =
    (iconId: AnswerIconId) =>
    (description: string): void => {
      dispatch({ type: 'update-description', iconId, description });
    };

  return (
    <div class={constant(styles.settings)} data-e2e={constant('icon-settings')}>
      <div>{constant(dc.title)}</div>
      <Description text={constant(dc.description)} />
      <AnswerIconRow
        answerIcon={view(answerIcons$, (a) => a.good)}
        iconId={'good'}
        onDescriptionChange={onDescriptionChange('good')}
      />
      <AnswerIconRow
        answerIcon={view(answerIcons$, (a) => a.fair)}
        iconId={'fair'}
        onDescriptionChange={onDescriptionChange('fair')}
        onPointChange={(point) => {
          dispatch({ type: 'update-point', iconId: 'fair', point });
        }}
      />
      <AnswerIconRow
        answerIcon={view(answerIcons$, (a) => a.poor)}
        iconId={'poor'}
        onDescriptionChange={onDescriptionChange('poor')}
      />
    </div>
  );
};
