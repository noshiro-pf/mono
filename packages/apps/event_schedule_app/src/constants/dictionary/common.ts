export const commonDictionary = {
  date: {
    dayList: ['日', '月', '火', '水', '木', '金', '土'],
    dayWrapperBrace: {
      start: '（',
      end: '）',
    },
    timeRangeTilde: '～',
  },
  colon: '：',
  tilde: '～',
  brace: {
    start: '(',
    end: ')',
  },
  braceJp: {
    start: '（',
    end: '）',
  },
  buttonText: {
    decide: '決定',
    cancel: 'キャンセル',
    register: '登録する',
    delete: '削除する',
    reset: 'リセット',
    close: '閉じる',
  },
  error: {
    invalidEmail: '有効なメールアドレスではありません。',
    passwordNotMatch: 'パスワードが一致しません。',
  },
  mapTo: '→',
} as const;
