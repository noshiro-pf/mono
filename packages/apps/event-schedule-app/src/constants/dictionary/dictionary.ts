import { accountSettingsDictionary } from './account-settings';
import { answerPageDictionary } from './answer-page';
import { commonDictionary } from './common';
import { createEventResultDialogDictionary } from './create-event-result-dialog';
import { errorMessagesDictionary } from './error-messages';
import { eventListPageDictionary } from './event-list-page';
import { eventSettingsPageDictionary } from './event-settings-page';
import { forNonLoggedInUserDictionary } from './for-non-logged-in-user-dialog';
import { headerDictionary } from './header';
import { iconDescriptionDefaultDictionary } from './icon-description-default';
import { signInAndRegisterPageDictionary } from './register-page';
import { resultPageDictionary } from './result-page';

export const dict = {
  aboutThisApp: 'このアプリについて',
  pageNotFound: 'ページが見つかりませんでした。',
  topPage: 'トップページ',

  header: headerDictionary,
  eventListPage: eventListPageDictionary,
  eventSettingsPage: eventSettingsPageDictionary,
  resultPage: resultPageDictionary,
  iconDescriptionDefault: iconDescriptionDefaultDictionary,
  createEventResultDialog: createEventResultDialogDictionary,
  answerPage: answerPageDictionary,
  errorMessages: errorMessagesDictionary,
  common: commonDictionary,
  register: signInAndRegisterPageDictionary,
  accountSettings: accountSettingsDictionary,
  forNonLoggedInUser: forNonLoggedInUserDictionary,
} as const;
