import type { AnswerIconPoint } from '@noshiro/event-schedule-app-shared';

export const answerPageDictionary = {
  title: '日程調整 回答ページ',
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
  point: (p: AnswerIconPoint): string => `（${p}点）`,
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
    defaultPoint: AnswerIconPoint
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
    theNameIsAlreadyUsed: 'その名前は既に使われています。',
    required: {
      title: '私は必須参加者です',
      description: [
        'これを有効にした場合、自分一人が×をつけるだけでその候補日程のスコアが0点になり、候補から外されます。',
      ],
    },
    weight: {
      title: '何人分としてカウントするか',
      description: [
        '集計表のスコア計算でこの回答を何人分としてカウントするかを設定できます。',
        'この回答の優先度を上げたい場合に1より大きい値を、下げたい場合に1より小さい値を設定するという使い方もできます。',
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
} as const;
