/** The name of the app, after each page's own in the tab. */
const appName = 'イベント日程調整';

/** The document's title of each page, shown in the browser's tab. */
export const pageTitleDictionary = {
  create: `日程調整の作成 | ${appName}`,
  answer: `日程調整 回答ページ | ${appName}`,
  edit: `日程調整の設定編集 | ${appName}`,
  eventList: `日程調整一覧 | ${appName}`,
  register: `新規登録 | ${appName}`,
  signIn: `ログイン | ${appName}`,
} as const;
