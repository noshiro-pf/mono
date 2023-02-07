import { commonDictionary } from './common';
import { ymd2str } from './datetime';
import { detailedFilterDictionary } from './detailed-filter-dialog';

const genTagName = (
  icon: '△' | '✕' | '〇'
): ((min: number, max: number) => string) => {
  const commonText = `${icon}の個数`;

  return (min: number, max: number): string =>
    min === max
      ? `${commonText} = ${min}`
      : min === 0
      ? max === Num.POSITIVE_INFINITY
        ? `${commonText} ≦ ∞` // dummy
        : `${commonText} ≦ ${max}`
      : max === Num.POSITIVE_INFINITY
      ? `${min} ≦ ${commonText}`
      : `${min} ≦ ${commonText} ≦ ${max}`;
};

const genTagNameAdded = (
  ...[icon1, icon2]: readonly ['△', '✕'] | readonly ['〇', '△']
): ((min: number, max: number) => string) => {
  const commonText = `${icon1}の個数+${icon2}の個数`;

  return (min: number, max: number): string =>
    min === max
      ? `${commonText} = ${min}`
      : min === 0
      ? max === Num.POSITIVE_INFINITY
        ? `${commonText} ≦ ∞` // dummy
        : `${commonText} ≦ ${max}`
      : max === Num.POSITIVE_INFINITY
      ? `${min} ≦ ${commonText}`
      : `${min} ≦ ${commonText} ≦ ${max}`;
};

export const answerPageDictionary = {
  title: '日程調整 回答ページ',
  answerLater: {
    button: '後で回答する',
    confirmButton: '仮登録する',
    message: '全日程が空欄の状態で回答を仮登録します。',
    description: [
      '仮登録することで幹事にとりあえず参加意思があることを伝えることができます。',
      'また、仮登録によりこの日程調整とアカウントが紐づくことで、日程調整一覧に表示されるようになります。',
      '各日程の回答は空欄で登録されるので、後で回答を埋めるのを忘れないようにしてください。',
    ].join(''),
    result: {
      success: '仮登録しました。',
    },
  },

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
      editButtonConfirmDialogValidationFailedMessage:
        '登録されているメールアドレスと一致しません。',
      back: '前のページに戻る',
      error: 'メールアドレスの照合中にエラーが発生しました。',
      success: 'メールアドレスが確認できました。',
    },
  },
  point: (p: AnswerIconPoint): string => `（${p}点）`,

  detailedFilter: detailedFilterDictionary,

  answers: {
    title: '回答一覧',

    tagInput: {
      sort: (sortKey: 'date' | 'score', sortOrder: 'asc' | 'desc') =>
        `${match(sortKey, {
          date: '日時',
          score: 'スコア',
        })}${match(sortOrder, {
          asc: '昇順',
          desc: '降順',
        })}で並べ替え`,

      good: genTagName('〇'),
      fair: genTagName('△'),
      poor: genTagName('✕'),
      goodPlusFair: genTagNameAdded('〇', '△'),
      fairPlusPoor: genTagNameAdded('△', '✕'),

      scoreRange: ({ min, max }: Readonly<{ min: number; max: number }>) =>
        `${min.toFixed(2)} ≦ スコア ≦ ${max.toFixed(2)}`,

      dateRange: (start: YearMonthDate, end: YearMonthDate) =>
        `日程：${ymd2str(start)} ～ ${ymd2str(end)}`,

      dayOfWeek: ({
        Sun,
        Mon,
        Tue,
        Wed,
        Thr,
        Fri,
        Sat,
      }: Readonly<{
        Sun: boolean;
        Mon: boolean;
        Tue: boolean;
        Wed: boolean;
        Thr: boolean;
        Fri: boolean;
        Sat: boolean;
      }>) =>
        pipe(
          Arr.zip(
            [Sun, Mon, Tue, Wed, Thr, Fri, Sat] as const,
            commonDictionary.date.dayList
          )
            .filter(([checked, _displayName]) => checked)
            .map(([_, displayName]) => displayName)
        ).chain((list) =>
          Arr.isEmpty(list) ? '曜日：なし' : `${list.join('・')}のみ`
        ).value,

      iconOfSpecifiedRespondent: '回答者の記号で絞り込み（詳細設定）',
    },

    datetime: '候補日程',
    score: 'スコア',
    numAnswersUnit: '人',
    addAnswer: '回答を追加する',
    sortAsc: '昇順ソート',
    sortDesc: '降順ソート',
    comment: 'コメント',
    times: '✕',
    weight: '回答の優先度',
    refresh: '更新',
    saveScreenShot: '画像として保存',
    detailedFilterSettingsButton: '日程絞り込みの詳細設定',
    requiredParticipant: '必須参加者',
    iconHeaderFilter: {
      ge: '個以上',
      le: '個以下',
      enableFilteringSwitchLabel: '絞り込み',
      good: {
        title: '〇の個数でフィルタ',
      },
      fair: {
        title: '△の個数でフィルタ',
      },
      poor: {
        title: '✕の個数でフィルタ',
      },
    },
  },
  requiredParticipantDescription:
    '（必須参加者が✕を付けている日のスコアは0点になります。）',
  noteForPointOfFair: (
    defaultPoint: AnswerIconPoint
  ): readonly [string, string] => [
    '回答者が個別に△の点数を設定している場合があります。',
    `デフォルトの点数（＝${defaultPoint}点）から変更されている場合は、△の右隣に括弧付きでその点数が表示されています。`,
  ],

  protectedAnswerIsNotEditable:
    'この回答は作成者により保護されているため、本人のアカウントでログイン中のみ編集できます。',

  answerBeingEdited: {
    title: {
      create: '回答追加',
      update: '回答編集',
    },
    table: {
      header: {
        score: 'スコア',
        comment: 'コメント',
      },
    },
    yourName: 'あなたの名前：',
    comments: 'コメント（任意）：',
    nameIsRequired: '名前は必須項目です',
    theNameIsAlreadyUsed: 'その名前は既に使われています。',
    required: {
      title: '私は必須参加者です',
      description: [
        'これを有効にした場合、自分一人が✕をつけるだけでその候補日程のスコアが0点になり、候補から外されます（〇や△をつけた日程はそのままです）。',
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
    protected: {
      title: 'この回答を保護する',
      description: {
        enabled: [
          'この回答を他のユーザーに編集・削除されないように保護します。',
          '自身でもログインしていない状態ではこの回答を編集できなくなります。',
          'この日程調整はアカウントと紐づけられ、日程調整一覧に表示されます。',
        ],
        disabled: [
          'この回答は誰でも編集・削除できるようになります（保護されません）。',
          'ログインしていない状態でもこの回答を編集できるようになります。',
          'この日程調整はアカウントと紐づけられなくなり、日程調整一覧にも表示されません。',
        ],
      },
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
