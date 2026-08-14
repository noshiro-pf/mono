import { accountSettingsDictionary } from './account-settings.mjs';
import { answerPageDictionary } from './answer-page.mjs';
import { commonDictionary } from './common.mjs';
import { createEventResultDialogDictionary } from './create-event-result-dialog.mjs';
import { errorMessagesDictionary } from './error-messages.mjs';
import { eventListPageDictionary } from './event-list-page.mjs';
import { eventSettingsPageDictionary } from './event-settings-page.mjs';
import { forNonLoggedInUserDictionary } from './for-non-logged-in-user-dialog.mjs';
import { headerDictionary } from './header.mjs';
import { iconDescriptionDefaultDictionary } from './icon-description-default.mjs';
import { signInAndRegisterPageDictionary } from './register-page.mjs';
import { resultPageDictionary } from './result-page.mjs';

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
