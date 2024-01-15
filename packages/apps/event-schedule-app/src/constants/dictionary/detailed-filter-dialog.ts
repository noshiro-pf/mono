import { daysOfWeek } from '@noshiro/ts-utils-additional';

export const detailedFilterDictionary = {
  title: '絞り込み 詳細設定',
  buttons: {
    back: '戻る',
    submit: '決定',
  },
  filterItems: {
    answerIcon: '［記号で絞り込み］',
    filledDateOnly: '全員回答済みの候補日のみ表示',
    score: 'スコアで絞り込み',
    datetimeRange: '日程範囲で絞り込み',
    dayOfWeek: {
      title: '曜日で絞り込み',
      items: daysOfWeek.jp,
    },
    iconOfSpecifiedRespondent: {
      title: '回答者の記号で絞り込み（URLには保存されません）',
      unanswered: '未回答',
    },
    filterOutSomeAnswer: '［回答の一部を抜き出して集計］',
    respondent: {
      title: '回答者を選択して表示',
    },
  },
} as const;
