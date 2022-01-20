import { headerDictionary } from './header';

export const accountSettingsDictionary = {
  button: {
    update: '更新する',
  },
  reauthenticate: {
    password: 'パスワード（確認）',
    message: {
      wrongPassword: 'パスワードが間違っています。',
      error: '再認証でエラーが発生しました。',
    },
  },
  updateDisplayName: {
    title: headerDictionary.auth.menu.changeDisplayName,
    label: '新しいユーザー名',
    message: {
      success: 'ユーザー名を更新しました。',
      error: 'ユーザー名の更新時にエラーが発生しました。',
    },
  },
  updateEmail: {
    title: headerDictionary.auth.menu.changeEmail,
    label: '新しいメールアドレス',
    message: {
      success: 'メールアドレスを更新しました。',
      error: 'メールアドレスの更新時にエラーが発生しました。',
    },
    currentEmail: '現在のメールアドレス',
  },
  updatePassword: {
    title: headerDictionary.auth.menu.changePassword,
    newPassword: '新しいパスワード',
    oldPassword: '古いパスワード',
    newPasswordConfirmation: '新しいパスワード（確認）',
    currentEmail: 'メールアドレス',
  },
  deleteAccount: {
    title: headerDictionary.auth.menu.deleteAccount,
    label: 'パスワード',
  },
} as const;
