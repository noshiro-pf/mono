import { headerDictionary } from './header';

export const accountSettingsDictionary = {
  button: {
    update: '更新する',
    deleteAccount: 'アカウントを削除する',
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
    newDisplayName: '新しいユーザー名',
    message: {
      success: 'ユーザー名を更新しました。',
      error: 'ユーザー名の更新時にエラーが発生しました。',
    },
  },
  updateEmail: {
    title: headerDictionary.auth.menu.changeEmail,
    currentEmail: '現在のメールアドレス',
    newEmail: '新しいメールアドレス',
    message: {
      success: 'メールアドレスを更新しました。',
      error: 'メールアドレスの更新時にエラーが発生しました。',
    },
  },
  updatePassword: {
    title: headerDictionary.auth.menu.changePassword,
    newPassword: '新しいパスワード',
    oldPassword: '現在のパスワード',
    verifyNewPassword: '新しいパスワード（確認）',
    currentEmail: 'メールアドレス',
    message: {
      success: 'パスワードを更新しました。',
      error: 'パスワードの更新時にエラーが発生しました。',
    },
  },
  deleteAccount: {
    title: headerDictionary.auth.menu.deleteAccount,
    verifyEmail: 'メールアドレス（確認）',
    message: {
      success: 'アカウントを削除しました。',
      error: 'アカウントを削除時にエラーが発生しました。',
    },
  },
} as const;
