import { answerPageDictionary } from './answer-page';
import { commonDictionary } from './common';
import { createEventResultDialogDictionary } from './create-event-result-dialog';
import { errorMessagesDictionary } from './error-messages';
import { eventSettingsPageDictionary } from './event-settings-page';
import { iconDescriptionDefaultDictionary } from './icon-description-default';
import { resultPageDictionary } from './result-page';

export const dict = {
  aboutThisApp: 'このアプリについて',
  pageNotFound: 'ページが見つかりませんでした。',
  topPage: 'トップページ',

  eventSettingsPage: eventSettingsPageDictionary,
  resultPage: resultPageDictionary,
  iconDescriptionDefault: iconDescriptionDefaultDictionary,
  createEventResultDialog: createEventResultDialogDictionary,
  answerPage: answerPageDictionary,
  errorMessages: errorMessagesDictionary,
  common: commonDictionary,
} as const;
