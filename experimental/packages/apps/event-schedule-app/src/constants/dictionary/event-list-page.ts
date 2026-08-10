export const eventListPageDictionary = {
  title: '日程調整一覧',
  listItem: {
    name: (eventName: string): string => `「${eventName}」`,
    hasUnanswered: '（未回答日程あり）',
    answerDeadline: '回答期限',
    expired: '期限切れ',
    noAnswerDeadline: 'なし',
    author: '作成者',
    anonymous: '匿名',
    datetimeOptions: '候補日程',
    createdAt: '作成日',
    lastUpdate: '最終更新',
  },
  refresh: '更新',
  search: '検索',
  itemCount: (n: SafeUint) => `${n}件`,
  archive: 'アーカイブする',
  unarchive: 'アーカイブ解除する',
  confirmationMessage: {
    archive: {
      title: 'この日程調整をアーカイブしますか？',
      description: [
        'この操作は「アーカイブ」一覧から取り消すことができます。',
        'この操作が他のユーザーの画面に影響を与えることはありません。',
      ].join(''),
    },
    unarchive: {
      title: 'この日程調整をアーカイブ解除しますか？',
      description: [
        'この操作は「進行中」のイベント一覧から取り消すことができます。',
        'この操作が他のユーザーの画面に影響を与えることはありません。',
      ].join(''),
    },
  },
  archivingDone: 'アーカイブしました。',
  unArchivingDone: 'アーカイブ解除しました。',
  errorOccurred: 'エラーが発生しました。',
  filter: {
    inProgress: '進行中',
    archive: 'アーカイブ',
    showOnlyEventSchedulesICreated: '自分が作成した日程調整のみ表示',
    showAllPastDaysEvent: '候補日程が過去日の日程調整も表示',
    searchInput: 'キーワード検索',
  },
} as const;
