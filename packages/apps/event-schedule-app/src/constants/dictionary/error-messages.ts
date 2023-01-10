export const errorMessagesDictionary = {
  eventScheduleNotFound: '指定されたページが見つかりませんでした。',
  answersResultNotFound: '指定されたページが見つかりませんでした。',
  eventScheduleOtherError:
    '何らかのエラーによりイベント情報の取得に失敗しました。',
  answersResultOtherError: '何らかのエラーにより回答データ取得に失敗しました。',
  errorHandler: {
    showDetails: '詳細を表示',
    hideDetails: '詳細を隠す',
    unexpectedError: '予期せぬエラーが発生しました。',
    reloadThisPage: 'ページを再読み込みしてください。',
    sendReport: {
      log: 'エラーログ',
      button: 'エラーログと説明を送信する',
      success: 'エラー報告を送信しました。ご協力ありがとうございました。',
      error: 'エラー報告の送信に失敗しました。',
      description: {
        helperText: 'エラーが発生したときの状況を分かる範囲で教えてください。',
        label: '補足説明',
        labelInfo: '（任意）',
      },
    },
  },
} as const;
