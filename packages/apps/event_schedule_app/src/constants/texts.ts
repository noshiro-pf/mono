export const texts = {
  pageNotFound: 'ページが見つかりませんでした。',
  createEventPage: {
    title: '日程調整',
    section1: {
      titleAndNotesSectionTitle:
        'イベント名・ノートを入力してください。（1/3）',
      eventName: 'イベント名（必須項目）',
      eventNamePlaceholder: 'ボードゲーム会',
      notes: 'ノート',
      notesPlaceholder: '日程を回答してください。',
    },
    section2: {
      selectDatesSectionTitle: '候補日を選択してください。（2/3）',
      datetimeSpecification: '時刻指定オプション',
      datetimeSpecificationOptions: {
        noStartEndSpecified: '時刻なし',
        startSpecified: '開始時刻のみ',
        endSpecified: '終了時刻のみ',
        startAndEndSpecified: '開始時刻～終了時刻',
      },
      removeAllDates: '全削除',
      removeAllConfirmation:
        '日程を全削除しますか？（この操作は取り消すことができません）',
      removeAllResultMessage: '削除しました。',
      setTimesAtOneTime: '時刻一括変更',
      sortDatetimes: '日時を並べ替える',
    },
    section3: {
      otherSettingsTitle: 'その他の設定（3/3）',
      answerDeadline: '回答期限',
      howAnswerDeadlineIsUsed:
        '設定した場合、回答期限以降に回答を追加・編集できなくなります。',
      usePassword: '編集用パスワードを設定',
      howPasswordIsUsed:
        '設定した場合、イベント作成後の編集時にパスワード入力が求められるようになります。',
      symbolSettings: '回答に使う記号をカスタマイズ',
      customizeSymbolDescription:
        '記号の追加機能は今後のアップデートで追加予定です！',
      point: '点',
    },
    errorMessages: {
      titleIsEmpty: 'イベント名は必須項目です。',
      datetimeIsEmpty: '少なくとも1つ以上の候補日を選択してください。',
      answerDeadlineIsEnabledButEmpty:
        '回答期限をオンにしていますが空欄になっています。',
      passwordIsEnabledButEmpty:
        'パスワードをオンにしていますが空欄になっています。',
      atLeastTwoSymbolsRequired: '少なくとも2つの記号を設定してください。',
    },
    createEventButton: 'イベントを作成',
  },

  resultPage: {
    totalizedResult: '集計結果',
    score: 'スコア',
    addAnswer: '回答を追加する',
  },

  addAnswerPage: {
    yourName: 'あなたの名前',
    theNameIsAlreadyUsed: 'その名前は既に使われています',
    comment: 'コメント',
  },

  symbolDescriptionDefault: {
    circle: '行けます',
    triangleUp: '行けるかも',
    cross: '行けません',
  },

  buttonText: {
    deside: '決定',
    cancel: 'キャンセル',
    register: '登録する',
    delete: '削除する',
  },
} as const;
