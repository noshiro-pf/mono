import { daysOfWeek } from '@noshiro/ts-utils-additional';
import { defaultIconPoint } from '../default-icon-point';

export const eventSettingsPageDictionary = {
  title: '日程調整',
  editSubTitle: (title: string) => `イベント「${title}」の設定編集`,
  section1: {
    titleAndNotesSectionTitle: 'イベント名・ノートを入力してください。（1/3）',
    eventName: 'イベント名',
    eventNameInfo: '（必須項目）',
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
    setTimesAtOneTimeForDay: {
      title: '以下の曜日に適用',
      items: daysOfWeek.jp,
      checkAll: '全選択',
      flipAll: '反転',
    },
    sortDatetimes: '日時を昇順に並べ替える',
  },
  section3: {
    otherSettingsTitle: 'その他の設定（3/3）',
    answerDeadline: {
      title: '回答期限',
      howAnswerDeadlineIsUsed: [
        '回答期限を設定して、幹事用の通知設定',
        '回答期限を過ぎると、回答を追加・編集できないようになります。',
      ],
    },
    notification: {
      description: [
        '回答が追加されたときや、回答期限が近づいたときなどにメールで通知するよう設定することができます。',
        '回答期限に関する通知設定を有効にするには、一つ前のセクションで回答期限を設定する必要があります。',
      ],
      useNotification: '幹事用通知設定',
      emailAddress: '通知先メールアドレス',
      notifyOnAnswerChange: '回答に更新があったときにメール通知',
      notifyAfterAnswerDeadline: '回答期限を過ぎたらメール通知',
      notify00daysBeforeAnswerDeadline: '回答期限当日にメール通知',
      notify01daysBeforeAnswerDeadline: '回答期限1日前にメール通知',
      notify03daysBeforeAnswerDeadline: '回答期限3日前にメール通知',
      notify07daysBeforeAnswerDeadline: '回答期限7日前にメール通知',
      notify14daysBeforeAnswerDeadline: '回答期限14日前にメール通知',
      notify28daysBeforeAnswerDeadline: '回答期限28日前にメール通知',
    },
    iconSettings: {
      title: '回答に使う記号の設定',
      description: `右の数字は日程決めのスコア計算に使う点数です（△のデフォルト点数は初期値(=${defaultIconPoint.fair})から変更できます）。`,
    },
  },
  errorMessages: {
    titleIsEmpty: 'イベント名は必須項目です。',
    datetimeIsEmpty: '少なくとも一つ以上の候補日を選択してください。',
    answerDeadlineIsEnabledButEmpty:
      '回答期限をオンにしていますが空欄になっています。',
    passwordIsEnabledButEmpty:
      'パスワードをオンにしていますが空欄になっています。',
    atLeastOneNotificationCheckRequired:
      '通知設定をオンにした場合は、少なくとも一つの通知項目にチェックをしてください。',
    answerIcons:
      '記号の設定に不備があります。説明に空欄があるか、△の点数が0.1以上9.9以下になっていない可能性があります。',
  },
  createEventButton: '日程調整ページを作成',
  editEventButton: {
    name: 'イベント設定を更新',
    submitEditingConfirmation:
      '編集項目に日程の削除が含まれています。その日程への回答が既にある場合、その回答は失われてしまいますが、よろしいですか？',
    cancelResultMessage: '編集をキャンセルしました。',
  },
  createEventResultMessage: {
    success: 'イベント設定を作成しました。',
    error: 'イベント設定の作成中にエラーが発生しました。',
  },
  editEventResultMessage: {
    success: 'イベント設定を更新しました。',
    error: 'イベント設定の更新中にエラーが発生しました。',
  },
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
  diff: {
    title: '変更差分',
    values: {
      none: 'なし',
    },
    items: {
      title: 'イベント名：',
      notes: 'ノート：',
      datetimeSpecification: '時刻指定方法：',
      datetimeRangeList: {
        title: '候補日程',
        added: '追加',
        deleted: '削除',
      },
      answerDeadline: '回答締切日：',
      notificationSettings: {
        title: '通知設定',
        on: 'オン',
        off: 'オフ',
      },
      answerIcons: {
        title: '記号',
        good: {
          title: '〇',
          description: '説明：',
        },
        fair: {
          title: '△',
          description: '説明：',
          point: '点：',
        },
        poor: {
          title: '✕',
          description: '説明：',
        },
      },
      author: '作成者：',
      timezoneOffsetMinutes: 'タイムゾーン：',
    },
  },
} as const;
