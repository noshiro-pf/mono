import { answerPageDictionary } from './answer-page';
import { commonDictionary } from './common';
import { createEventResultDialogDictionary } from './create-event-result-dialog';
import { errorMessagesDictionary } from './error-messages';
import { eventSettingsPageDictionary } from './event-settings-page';
import { headerDictionary } from './header';
import { iconDescriptionDefaultDictionary } from './icon-description-default';
import { registerPageDictionary } from './register-page';
import { resultPageDictionary } from './result-page';

export const dict = {
  aboutThisApp: 'このアプリについて',
  pageNotFound: 'ページが見つかりませんでした。',
  topPage: 'トップページ',

  header: headerDictionary,
  eventSettingsPage: eventSettingsPageDictionary,
  resultPage: resultPageDictionary,
  iconDescriptionDefault: iconDescriptionDefaultDictionary,
  createEventResultDialog: createEventResultDialogDictionary,
  answerPage: answerPageDictionary,
  errorMessages: errorMessagesDictionary,
  common: commonDictionary,
  register: registerPageDictionary,
} as const;
