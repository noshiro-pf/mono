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
      usePassword: '設定編集用パスワードを設定',
      howPasswordIsUsed:
        '日程調整作成後のイベント名や候補日程等の編集時にパスワード入力が求められるようになります。',
      symbolSettings: '回答に使う記号をカスタマイズ',
      customizeSymbolDescription:
        '記号の追加機能は今後のアップデートで追加予定です！',
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
    createEventButton: '日程調整ページを作成',
    resetButton: {
      name: 'リセット',
      resetConfirmation:
        '入力項目をすべてリセットしますか？（この操作は取り消すことができません）',
      resetResultMessage: 'リセットしました。',
    },
  },

  resultPage: {
    totalizedResult: '集計結果',
    score: 'スコア',
    addAnswer: '回答を追加する',
  },

  symbolDescriptionDefault: {
    circle: '参加します',
    triangleUp: '参加できるかも',
    cross: '参加できません',
  },

  buttonText: {
    deside: '決定',
    cancel: 'キャンセル',
    register: '登録する',
    delete: '削除する',
    reset: 'リセット',
    close: '閉じる',
  },
  createEventResultDialog: {
    title: '日程調整ページが作成されました！',
    titleLoading: '日程調整ページを作成中です…',
    clipboardButton: 'クリップボードにコピー',
    description:
      'イベントが作成されました。 以下のURLをメール等を使って皆に知らせてあげましょう。 以降、このURLページにて各自の出欠情報を入力してもらいます。',
    openEventPageCreated: '日程調整ページを開く',
    discardEventPage: '破棄して作成画面に戻る',
    back: '作成画面に戻る',
  },

  answerPage: {
    title: '日程調整 回答ページ',
    errorMessages: {
      eventScheduleNotFound: '指定されたページが見つかりませんでした。',
    },
    eventInfo: {
      title: '概要',
      eventName: 'イベント名',
      notes: 'ノート',
      answerDeadline: '回答期限',
      answerDeadlineIsExpired: '回答を締め切りました。',
      answerDeadlineDescription:
        '回答期限を過ぎると回答の追加・編集ができなくなります。',
    },

    answers: {
      title: '回答一覧',
      datetime: '候補日程',
      score: 'スコア',
      numAnswersUnit: '人',
      addAnswer: '回答を追加する',
      sortAsc: '昇順ソート',
      sortDesc: '降順ソート',
      comment: 'コメント',
      refresh: '更新',
    },
    myAnswer: {
      title: {
        create: '回答追加',
        update: '回答編集',
      },
      yourName: 'あなたの名前：',
      comments: 'コメント（オプション）：',
      theNameIsAlreadyUsed: 'その名前は既に使われています',

      submitButton: {
        create: '回答を追加する',
        update: '回答を更新する',
        createAnswerResultMessage: '追加しました。',
        updateAnswerResultMessage: '更新しました。',
      },
      deleteButton: {
        deleteAnswerConfirmation:
          '回答を削除しますか？（この操作は取り消すことができません）',
        deleteAnswerResultMessage: '削除しました。',
      },
    },
  },
  date: {
    dayList: ['日', '月', '火', '水', '木', '金', '土'],
    dayWrapperBrace: {
      start: '（',
      end: '）',
    },
    timeRangeTilde: '～',
  },
  colon: '：',
} as const;
