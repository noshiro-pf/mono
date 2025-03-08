export const dictionary = {
  submitTossMessage: ['このカードを', 'ペアに見せる'],
  submitToss: '決定',
  submitAnswer: '回答する',
  cancel: 'キャンセル',
  gameMessage: {
    startGame: '人数が揃ったらゲームを開始してください。',
    gameEnded: {
      youWin: 'ゲーム終了（あなたのチームの勝ち）',
      youLose: 'ゲーム終了（相手チームの勝ち）',
    },
    selectYourCardToToss: 'トスする（ペアに見せる）カードを選んでください。',
    selectYourCardAndAttack:
      'アタックに使う自分のカードを選び、アタックする敵のカードを選んでください。',
    selectYourCardToAttack: 'アタックする敵のカードを選んでください。',
  },

  gameMain: {
    loading: '読み込み中…',
    homeButton: 'ホーム',
    newGame: '新規ゲーム',
    shuffleSeats: ['席順を', 'シャッフル'],
    exit: '退出する',
    copyLink: ['部屋のリンク', 'をコピー'],
    startGame: 'ゲーム開始',
    endTurnButton: 'ターン終了',
    playerNamePlaceholder: '()',
  },

  notFoundPage: {
    title: 'ページが見つかりません',
    backToMain: 'メインページに戻る',
  },

  createRoom: {
    roomPassword: {
      label: '部屋のパスワード',
      placeholder: '(optional)',
    },
    hostUsername: {
      label: 'あなたの名前',
      placeholder: 'algo master',
    },
    button: '部屋を作成',
  },

  joinRoom: {
    roomPassword: {
      label: '部屋のパスワード',
      notMatch: 'パスワードが一致しません。',
    },
    username: {
      label: 'あなたの名前',
    },
    button: '入室',
  },
} as const;
