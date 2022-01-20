export const registerPageDictionary = {
  username: 'ユーザー名',
  password: 'パスワード',
  verifyPassword: 'パスワード（確認）',
  email: 'メールアドレス',
  title: {
    register: '新規登録',
    signIn: 'ログイン',
  },
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
  error: {
    invalidEmail: '有効なメールアドレスではありません。',
    emailAlreadyInUse: 'このメールアドレスは使用されています。',
    weakPassword: 'パスワードは6文字以上で入力してください。',
    userNotFound: 'ユーザーが見つかりません。',
    wrongPassword: 'パスワードが間違っています。',
  },
} as const;
