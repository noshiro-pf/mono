import type { AnswerSymbolPoint } from '@noshiro/event-schedule-app-shared';

export const texts = {
  aboutThisApp: 'このアプリについて',
  pageNotFound: 'ページが見つかりませんでした。',
  topPage: 'トップページ',
  eventSettingsPage: {
    title: '日程調整',
    editSubTitle: {
      prefix: 'イベント「',
      suffix: '」の設定編集',
    },
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
      howAnswerDeadlineIsUsed: [
        '設定した場合、回答期限以降に回答を追加・編集できなくなります。',
      ],
      usePassword: '設定編集用パスワードを設定',
      howPasswordIsUsed:
        '日程調整作成後のイベント名や候補日程等の編集時にパスワード入力が求められるようになります。',
      symbolSettings: '回答に使う記号をカスタマイズ',
      customizeSymbolDescription:
        '記号の追加機能は今後のアップデートで追加予定です！',
      useNotification: '幹事用通知設定',
      emailAddress: '通知先メールアドレス',
      notifyOnAnswerChange: '回答に更新があったときにメール通知',
      notify01daysBeforeAnswerDeadline: '回答締め切り1日前にメール通知',
      notify03daysBeforeAnswerDeadline: '回答締め切り3日前にメール通知',
      notify07daysBeforeAnswerDeadline: '回答締め切り7日前にメール通知',
      notify14daysBeforeAnswerDeadline: '回答締め切り14日前にメール通知',
      notify28daysBeforeAnswerDeadline: '回答締め切り28日前にメール通知',
    },
    errorMessages: {
      titleIsEmpty: 'イベント名は必須項目です。',
      datetimeIsEmpty: '少なくとも1つ以上の候補日を選択してください。',
      answerDeadlineIsEnabledButEmpty:
        '回答期限をオンにしていますが空欄になっています。',
      passwordIsEnabledButEmpty:
        'パスワードをオンにしていますが空欄になっています。',
      invalidEmail: '有効なメールアドレスではありません',
      atLeastOneNotificationCheckRequired:
        '通知設定をオンにする場合は少なくとも1つの通知にチェックをしてください。',
      answerSymbols:
        '記号の設定に不備があります。説明に空欄があるか、△の点数が0.1以上9.9以下になっていない可能性があります。',
    },
    createEventButton: '日程調整ページを作成',
    editEventButton: 'イベント設定を更新',
    editEventResultMessage: 'イベント設定を更新しました。',
    resetButton: {
      name: 'リセット',
      resetConfirmation:
        '入力項目をすべてリセットしますか？（この操作は取り消すことができません）',
      resetResultMessage: 'リセットしました。',
    },
    resetEditButton: {
      name: '編集前の設定に戻す',
      resetConfirmation:
        '編集内容をすべて元の設定に戻しますか？（この操作は取り消すことができません）',
      resetResultMessage: '編集前の設定に戻しました。',
    },
    backToAnswerPageButton: {
      name: '編集せずに回答ページに戻る',
      resetConfirmation:
        '編集内容を取り消して回答ページに戻りますか？（この操作は取り消すことができません）',
      resetResultMessage: '編集をキャンセルしました。',
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
    decide: '決定',
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
    createNew: '日程調整を新規作成',
    eventInfo: {
      title: '概要',
      eventName: 'イベント名',
      notes: 'ノート',
      answerDeadline: '回答期限',
      answerDeadlineIsExpired: '回答を締め切りました。',
      answerDeadlineDescription:
        '回答期限を過ぎると回答の追加・編集ができなくなります。',
      noAnswerDeadline: 'なし',
      editButton: 'イベント設定編集（幹事用）',
      verifyEmailDialog: {
        editButtonConfirmDialogTitle: '',
        editButtonConfirmDialogMessage:
          '通知用に設定したメールアドレスを入力してください。',
        editButtonConfirmDialogValidationFailedMessage: [
          '登録されているメールアドレスと一致しません。',
        ],
        back: '前のページに戻る',
      },
    },
    point: (p: AnswerSymbolPoint) => `（${p}点）`,
    answers: {
      title: '回答一覧',
      datetime: '候補日程',
      score: 'スコア',
      numAnswersUnit: '人',
      addAnswer: '回答を追加する',
      sortAsc: '昇順ソート',
      sortDesc: '降順ソート',
      comment: 'コメント',
      times: '×',
      weight: '回答の優先度',
      refresh: '更新',
      requiredParticipant: '必須参加者',
    },
    requiredParticipantDescription:
      '（必須参加者が×を付けている日のスコアは0点になります。）',
    noteForPointOfFair: (
      defaultPoint: AnswerSymbolPoint
    ): readonly [string, string] => [
      '回答者が個別に△の点数を設定している場合があります。',
      `デフォルトの点数（＝${defaultPoint}点）から変更されている場合は、△の右隣に括弧付きでその点数が表示されています。`,
    ],

    answerBeingEdited: {
      title: {
        create: '回答追加',
        update: '回答編集',
      },
      yourName: 'あなたの名前：',
      comments: 'コメント（オプション）：',
      nameIsRequired: '名前は必須項目です',
      theNameIsAlreadyUsed: 'その名前は既に使われています',
      required: {
        title: '私は必須参加者です',
        description: [
          'これを有効にした場合、自分一人が×をつけるだけでその候補日程のスコアが0点になり、候補から外されます。',
        ],
      },
      weight: {
        title: 'この回答の優先度を変更（オプション）',
        description: [
          '集計表のスコア計算でこの回答を何人分としてカウントするかを設定できます。',
          'この回答の優先度を上げたい場合は1より大きい値を、下げたい場合は1より小さい値を設定してください。',
        ],
        suffix: '人分としてカウント',
      },
      submitButton: {
        create: '回答を追加する',
        update: '回答を更新する',
        confirmPartiallyUnanswered:
          '未回答の日程がありますが、このまま提出してもよろしいですか？（後からの回答追加は可能です）',
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
  errorMessages: {
    eventScheduleNotFound: '指定されたページが見つかりませんでした。',
    answersResultNotFound: '指定されたページが見つかりませんでした。',
    eventScheduleOtherError:
      '何らかのエラーによりイベント情報の取得に失敗しました。',
    answersResultOtherError:
      '何らかのエラーにより回答データ取得に失敗しました。',
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
  brace: {
    start: '(',
    end: ')',
  },
} as const;
