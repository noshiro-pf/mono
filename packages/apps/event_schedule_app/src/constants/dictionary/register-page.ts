export const registerPageDictionary = {
  username: 'ユーザー名',
  password: 'パスワード',
  email: 'メールアドレス',
  registerButton: '新規登録',
  signInButton: 'ログイン',
  error: {
    invalidEmail: '有効なメールアドレスではありません。',
    emailAlreadyExists: 'このメールアドレスは使用されています。',
    invalidPassword:
      'パスワードには6文字以上の文字列を指定する必要があります。',
    userNotFound: 'ユーザーが見つかりません。',
    wrongPassword: 'パスワードが間違っています。',
  },
} as const;
