export const forNonLoggedInUserDictionary = {
  message: 'この機能はログインユーザーのみ利用できます。',
  confirmButton: 'ログインページへ移動',
  description: [
    'この機能はログインしているユーザーのみ利用できます。',
    '先にログイン、またはアカウント新規作成を行ってください。',
  ].join(''),
  link: {
    prefix: '機能の詳細については',
    body: 'こちら',
    suffix: 'をご覧ください。',
  },
} as const;
