import { css } from '@emotion/react';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import {
  iconListReducer,
  type IconListReducerAction,
} from '../../../functions/index.mjs';
import { noop } from '../../../utils-ported/index.mjs';
import { Description } from '../../atoms/index.mjs';
import { AnswerIconRow } from './icon-setting-row.js';

const dc = dict.eventSettingsPage.section3.iconSettings;

type Props = Readonly<{
  answerIcons: AnswerIconSettings;
  onAnswerIconsChange: (value: AnswerIconSettings) => void;
}>;

export const AnswerIconSettingsComponent = memoNamed<Props>(
  'AnswerIconSettings',
  ({ answerIcons, onAnswerIconsChange }) => {
    const dispatch = React.useCallback(
      (action: IconListReducerAction) => {
        onAnswerIconsChange(iconListReducer(answerIcons, action));
      },
      [answerIcons, onAnswerIconsChange],
    );

    const onOkDescriptionChange = React.useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'good', description });
      },
      [dispatch],
    );

    const onNeitherDescriptionChange = React.useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'fair', description });
      },
      [dispatch],
    );

    const onNeitherPointChange = React.useCallback(
      (point: AnswerIconPoint) => {
        dispatch({ type: 'update-point', iconId: 'fair', point });
      },
      [dispatch],
    );

    const onNgDescriptionChange = React.useCallback(
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
