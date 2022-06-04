export const signInAndRegisterPageDictionary = {
  username: 'ユーザー名',
  password: 'パスワード',
  verifyPassword: 'パスワード（確認）',
  email: 'メールアドレス',
  registerButton: '新規登録',
  signInButton: 'ログイン',
  resetPassword: 'パスワードをお忘れの場合',
  resetPasswordMode: {
    back: 'ログイン画面に戻る',
    title: 'パスワードを再発行',
    description:
      'ご登録頂いたメールアドレスを入力してください。新しいパスワードを発行いたします。',
    submit: '再発行',
  },
  separator: 'OR',
  google: {
    register: 'Googleアカウントで登録',
    signIn: 'Googleでログイン',
  },
  message: {
    success: {
      register: 'アカウントを作成しました。',
      signIn: 'ログインしました。',
      sendPasswordResetEmail: 'パスワードリセットメールを送信しました。',
    },
    error: {
      invalidEmail: '有効なメールアドレスではありません。',
      emailAlreadyInUse: 'このメールアドレスは使用されています。',
      weakPassword: 'パスワードは6文字以上で入力してください。',
      userNotFound: 'ユーザーが見つかりません。',
      wrongPassword: 'パスワードが間違っています。',
      unknownErrorOnRegister: 'アカウント作成に失敗しました。',
      unknownErrorOnSignIn: 'ログインに失敗しました。',
      unknownErrorOnSendingResetPasswordEmail:
        'パスワードリセットメールの送信に失敗しました。',
    },
  },
} as const;
