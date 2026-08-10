const sharedValues = {
  clipboardButton: 'クリップボードにコピー',
  openEventPageCreated: '日程調整ページを開く',
} as const;

export const createEventResultDialogDictionary = {
  title: '日程調整ページが作成されました！',
  titleLoading: '日程調整ページを作成中です…',
  clipboardButton: sharedValues.clipboardButton,
  whyButtonIsDisabled: `誤操作防止のため「${sharedValues.clipboardButton}」または「${sharedValues.openEventPageCreated}」をクリックするまで押せないようになっています。`,
  description: [
    'イベントが作成されました。 以下のURLをメール等を使って皆に知らせてあげましょう。',
    'このURLページにて各自の出欠情報を入力してもらいます。',
  ].join(''),
  openEventPageCreated: sharedValues.openEventPageCreated,
  discardEventPage: '破棄して作成画面に戻る',
  back: '作成画面に戻る',
} as const;
