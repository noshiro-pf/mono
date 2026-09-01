export const dictionary = {
  submitTossMessage: ['このカードを', 'ペアに見せる'],
  submitToss: '決定',
  submitAnswer: '回答する',
  cancel: 'キャンセル',
  gameMessage: {
    selectYourCardToToss: 'トスする（ペアに見せる）カードを選んでください。',
    selectYourCardAndAttack:
      'アタックに使う自分のカードを選び、アタックする敵のカードを選んでください。',
    selectYourCardToAttack: 'アタックする敵のカードを選んでください。',
  },

  gameMain: {
    endTurnButton: 'ターン終了',
  },

  notFoundPage: {
    title: 'ページが見つかりません',
    backToMain: 'メインページに戻る',
  },

  createRoom: {
    gamePassword: {
      label: '部屋のパスワード',
      placeholder: '(optional)',
    },
    username: {
      label: 'あなたの名前',
      placeholder: 'algo master',
    },
    button: '部屋を作成',
  },

  joinRoom: {
    gamePassword: {
      label: '部屋のパスワード',
      notMatch: 'パスワードが一致しません。',
    },
    username: {
      label: 'あなたの名前',
    },
    button: '入室',
  },
} as const;
