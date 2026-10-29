/**
 * The Japanese text of the page: the language the app was written in, and
 * the shape every other language's text has (`Messages`). A string here is
 * shown as it is; a function puts the values it takes into its sentence,
 * which is how word order is left to each language.
 */

export const ja = {
  /** Blueprint's date picker. */
  dateInputLocale: 'ja',

  app: {
    title: 'タスク管理',
    description:
      'タスクとマイルストーンの依存関係から、いま着手できるものを示すタスク管理アプリ',
    loading: '読み込み中…',
  },

  common: {
    close: '閉じる',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    confirmDelete: '削除する',
    keep: 'やめる',
    deleteConfirmation: '削除の確認',
    none: 'なし',
    unchanged: '変更しない',
    remove: '外す',
    /** Between the items of a short list on one line. */
    listSeparator: '・',
    /** Between the conditions a milestone waits for. */
    conditionSeparator: '、',
    /** A name quoted inside a sentence. */
    quoted: (text: string): string => `「${text}」`,
    /** `text` with a short note after it, as in a select's options. */
    withNote: (text: string, note: string): string => `${text}（${note}）`,
  },

  nodeKinds: {
    task: 'タスク',
    milestone: 'マイルストーン',
    group: 'グループ',
  },

  fields: {
    title: 'タイトル',
    description: '説明',
    status: '状態',
    priority: '優先度',
    dueDate: '期限',
    estimate: '見積',
    estimateHours: '見積（時間）',
    progress: '進捗',
    labels: 'ラベル',
    group: 'グループ',
    dependencies: '依存',
  },

  progress: {
    'not-started': '未着手',
    'in-progress': '作業中',
    'in-review': 'レビュー中',
    done: '完了',
  },

  displayStatus: {
    ready: '着手可',
    blocked: '待ち',
    'in-progress': '作業中',
    'in-review': 'レビュー中',
    done: '完了',
  },

  priority: {
    1: '最高',
    2: '高',
    3: '中',
    4: '低',
    5: '最低',
  },

  dependencyType: {
    'finish-to-start': '完了後',
    'start-to-start': '開始後',
  },

  duration: {
    days: (n: number): string => `${n}日`,
    hours: (n: number): string => `${n}時間`,
    minutes: (n: number): string => `${n}分`,
    /** Between the parts of `1日2時間`. */
    separator: '',
  },

  header: {
    addTask: '＋タスク',
    addMilestone: '＋マイルストーン',
    addGroup: '＋グループ',
    export: '書き出す',
    exportTitle: 'プロジェクトをファイルに書き出す',
    import: '読み込む',
    importTitle: 'ファイルからプロジェクトを読み込む',
    unreadableFile: (fileName: string): string =>
      `「${fileName}」を読めませんでした。`,
    signedInAs: (name: string): string => `${name} としてサインイン中`,
    signOut: 'サインアウト',
    signingOut: 'サインアウト中…',
    signedInFallback: 'サインイン中',
  },

  signIn: {
    lead: 'タスクとマイルストーンの依存関係から、いま着手できるものを示します。',
    signIn: 'Google でサインイン',
    signingIn: 'サインイン中…',
    failed: (reason: string): string =>
      `サインインできませんでした（${reason}）。`,
    popupBlocked:
      'ポップアップがブロックされました。このページのポップアップを許可して、もう一度お試しください。',
    unauthorizedDomain:
      'このドメインからのサインインは許可されていません。Firebase の承認済みドメインに追加してください。',
    network:
      'ネットワークに接続できませんでした。接続を確認して、もう一度お試しください。',
  },

  unsentWrites: {
    message:
      'オフライン中の変更がまだ送信されていないため、サインアウトしませんでした。いまサインアウトすると、この変更は失われます。',
    discard: '変更を破棄してサインアウト',
    stay: 'サインアウトしない',
  },

  views: {
    label: '表示',
    list: 'リスト',
    dag: 'DAG',
  },

  list: {
    tasks: 'タスク',
    milestones: 'マイルストーン',
    hideDone: '完了を隠す',
    sort: '並べ替え',
    sortKeys: '並べ替えのキー',
    noSortKeys: '並べ替えのキーはありません。',
    noTasks: '表示するタスクはありません。「＋タスク」から追加できます。',
    noMilestones:
      'マイルストーンはありません。「＋マイルストーン」から追加できます。',
    priority: (label: string): string => `優先度 ${label}`,
    estimate: (estimate: string): string => `見積 ${estimate}`,
    overdue: '期限切れ',
    warningTitle: '依存が未解消のまま作業中です',
    warning: '⚠ 依存未解消',
    unreached: '◇ 未到達',
    reached: '◆ 到達済み',
    awaitingCheck: '要確認',
    checked: '確認済み',
  },

  sort: {
    keys: {
      title: 'タイトル',
      dueDate: '期限',
      priority: '優先度',
      status: '状態',
      depth: '依存の深さ',
      createdAt: '作成日時',
      updatedAt: '更新日時',
      estimate: '見積',
    },
    orders: {
      asc: '昇順',
      desc: '降順',
    },
    ascending: '昇順 ↑',
    descending: '降順 ↓',
    addKey: 'キーを追加',
    addKeyOption: '＋キーを追加…',
    toggleOrder: (key: string, order: string): string =>
      `${key}の順序を切り替え（現在: ${order}）`,
    moveUp: (key: string): string => `${key}を上へ`,
    moveDown: (key: string): string => `${key}を下へ`,
    remove: (key: string): string => `${key}を外す`,
  },

  dag: {
    empty: 'タスクもマイルストーンもまだありません。',
    layoutFailed: (reason: string): string =>
      `レイアウトを計算できませんでした（${reason}）。`,
    layingOut: 'レイアウトを計算中…',
    viewMode: '表示形式',
    viewModes: {
      dag: 'DAG',
      arc: 'アーク',
      tile: 'タイル',
    },
    direction: '伸ばす向き',
    right: '右へ',
    down: '下へ',
    arrange: '自動整列',
    lasso: 'なげなわ',
    lassoTitle:
      '背景のドラッグで囲んだノードを選びます（Shift を押しながらのドラッグでも選べます）',
    rectangle: '矩形選択',
    rectangleTitle: '背景のドラッグで描いた矩形に入るノードを選びます',
    zoomIn: '拡大',
    zoomOut: '縮小',
    actualSize: '等倍表示',
    fitAll: '全体表示',
    descriptions: {
      dag: '依存関係グラフ。ノードを選ぶと詳細を開きます。ノードはドラッグか矢印キーで動かせます。ノードの縁の丸からほかのノードへドラッグすると、ドロップしたノードがそのノードに依存します。依存の矢印を選ぶと、削除ボタンか Delete キーで削除できます。背景のドラッグで移動、ホイールかピンチで拡大縮小できます。Shift を押しながら、または「なげなわ」をオンにして背景をドラッグすると、囲んだノードを選び、まとめて動かしたり一括編集したりできます。',
      arc: 'アークダイアグラム。タスクをタイトル順に縦に並べ、マイルストーンをそれを待つタスクの上に入れて、依存を右側の弧で示します。ノードを選ぶと詳細を開きます。ドラッグで移動、ホイールかピンチで拡大縮小できます。',
      tile: 'タスクをタイトル順に左上から横に並べ、幅に収まらない分は次の行に折り返します。依存は示しません。タスクを選ぶと詳細を開きます。ホイール、ドラッグ、Page Up・Page Down・Home・End キーで縦にスクロールできます。',
    },
    deleteEdge: (dependent: string, source: string): string =>
      `「${dependent}」の「${source}」への依存を削除`,
    group: (title: string): string => `グループ「${title}」`,
    selection: '選択したノード',
    selected: (count: number): string => `${count} 件を選択中`,
    confirmDeleteSelected: (count: number): string =>
      `${count} 件を依存ごと削除しますか？`,
    bulkEdit: '一括編集',
    clearSelection: '選択解除',
    compactTitle: (title: string, due: string, priority: string): string =>
      `${title}\n${due}・優先度 ${priority}`,
    noDue: '期限なし',
    due: (when: string): string => `期限 ${when}`,
    overdue: (when: string): string => `期限切れ ${when}`,
    milestoneDate: (when: string): string => `日時 ${when}`,
    taskLabel: (title: string): string => `タスク「${title}」`,
    milestoneLabel: (title: string): string => `マイルストーン「${title}」`,
    statusPart: (status: string): string => `状態: ${status}`,
    duePart: (when: string): string => `期限: ${when}`,
    overduePart: '期限切れ',
    priorityPart: (priority: string): string => `優先度: ${priority}`,
    warningPart: '依存が未解消のまま開始',
    reachedPart: '到達済み',
    unreachedPart: '未到達',
    datePart: (when: string): string => `日時: ${when}`,
    awaitingCheckPart: '解消待ち',
    /** The parts of a node's spoken name. */
    partSeparator: ' ',
    edgeLabel: (from: string, to: string, how: string): string =>
      `${from} → ${to}${how === '' ? '' : `（${how}）`}`,
  },

  settings: {
    title: '表示設定',
    filtering: '絞り込み中',
    filteringSuffix: '（絞り込み中）',
    groups: 'グループ',
    filter: '絞り込み',
    noGroup: 'グループなし',
    noLabel: 'ラベルなし',
    filterEmptyHint:
      'グループを作るか、タスクにラベルを付けると、ここで絞り込めます。',
    filterHint:
      'どれかに当てはまるものを、グループとラベルの両方を選んだときは両方に当てはまるものを表示します。ラベルで絞るとき、マイルストーンは残ったタスクとつながるものだけを表示します。絞り込みの外でも、直接つながるノードは薄く表示します。',
    clearFilter: '絞り込みを解除',
    showDone: '完了済みのタスク・到達済みのマイルストーンを表示',
    showDoneHint:
      'オフのあいだは、完了したタスクと到達したマイルストーン、そこからの依存の線を描きません。リストの「完了を隠す」とは別の設定です。',
    nodeSize: 'ノード',
    nodeSizes: {
      compact: 'コンパクト',
      standard: '標準',
      large: '大',
    },
    nodeSizeHint:
      '「コンパクト」はタイトルだけを 1 行で表示します。状態と優先度は色と、ポインタを重ねたときの説明で分かります。「大」はタイトルを 3 行まで折り返して表示します。',
    animation: 'アニメーション',
    animations: {
      auto: '自動',
      on: 'オン',
      off: 'オフ',
    },
    animationHint:
      'ノードが位置へ移るときのアニメーション。「自動」は端末の「視差効果を減らす」に従います。どの設定でも、動きが重いときは途中で止めてすぐ位置に置きます。',
    diagramSort: '並び順',
    diagramSortKeys: '並び順のキー',
    noDiagramSortKeys: 'キーがありません。タイトルの昇順で並べます。',
    diagramSortHint:
      '「アーク」と「タイル」で共通の並び順。上のキーから順に比べ、同じなら次のキーで比べます。',
    language: '言語',
    languageAuto: 'ブラウザに合わせる',
    languageHint:
      'この端末に保存します。切り替えるとページを読み込み直します。',
  },

  nodeDialog: {
    newTask: '新しいタスク',
    newMilestone: '新しいマイルストーン',
    startConditions: '着手条件（すべて満たされると着手可）',
    startConditionsHint:
      '特定の日時や外部要因を待つときは、マイルストーンを作って依存させます。',
    reachConditions: '到達条件（すべて満たすと到達）',
    milestoneDate: '日時（この日時になると到達）',
    requiresCheck: '手動チェックが必要（「解消」を押すと到達）',
    unchecked: '未解消',
    check: '解消',
    checkedAt: (when: string): string => `解消済み（${when}）`,
    uncheck: '未解消に戻す',
    unreached: '◇ 未到達',
    reachedAt: (when: string): string => `◆ 到達済み（${when}）`,
    waitingFor: (conditions: string): string => `待っている条件: ${conditions}`,
    waitingForDate: (when: string): string => `日時（${when}）`,
    waitingForCheck: '手動チェック',
    waitingForDependencies: (count: number): string =>
      `依存（未充足 ${count} 件）`,
    confirmDelete: '依存ごと削除しますか？',
  },

  milestoneExplanation: {
    heading: 'マイルストーンとは',
    what: '作業そのものではなく、タスクが着手可能になるタイミングを表す目印です（所要時間ゼロ）。下の到達条件がすべて満たされると「到達」し、このマイルストーンに依存するタスクが着手可（Ready）になります。',
    date: '日時: その日時になると到達します（例: 10/9 以降に着手したいタスクの前に置く）。',
    check:
      '手動チェック: 「解消」を押すと到達します（例: 先方の返答待ちなど、外部要因のブロッカー）。',
    dependency:
      '依存: タスクの完了・開始や、ほかのマイルストーンの到達を待ちます（例: 複数のタスクの完了をまとめた「実装完了」）。',
    none: '条件を何も指定しないと、作成した時点で到達済みになります。条件が後から満たされなくなった場合（依存先のタスクを差し戻したなど）は、未到達に戻ります。',
  },

  dateField: {
    allDay: '終日',
    clear: 'クリア',
    today: '今日',
    pickDate: '日付を選ぶ（例: 2026/10/09）',
    pickDateTime: '日時を選ぶ（例: 2026/10/09 18:00）',
    previousMonth: '前の月',
    nextMonth: '次の月',
    month: '月',
    year: '年',
    hours: '時',
    minutes: '分',
    increaseHours: '1 時間進める',
    decreaseHours: '1 時間戻す',
    increaseMinutes: '1 分進める',
    decreaseMinutes: '1 分戻す',
  },

  dependencies: {
    row: (index: number): string => `依存 ${index}`,
    none: '依存はありません。',
    add: '依存を追加',
    showDone: '完了したタスクも選択肢に出す',
    source: '依存先',
    choose: '選んでください',
    missingSource: '（見つからない依存先）',
    type: '種類',
    afterReached: '到達後',
    noType: '―',
    lagDays: 'ずらす日数',
    lagHours: '時間',
    removeRow: (name: string): string => `${name}を外す`,
    met: '充足',
    unmet: '未充足',
    option: (kind: string, title: string, done: boolean): string =>
      `${kind}: ${title}${done ? '（完了）' : ''}`,
    describe: (source: string, waitsFor: string, lag: string): string =>
      `${source} の${waitsFor}${lag === '' ? '' : ` ${lag}`}`,
    deletedTask: '（削除されたタスク）',
    deletedMilestone: '（削除されたマイルストーン）',
    sourceMissing: '依存先が見つかりません。外してください。',
    alreadyDependsOn: (title: string): string =>
      `${title} にはすでに依存しています。`,
    self: '自分自身には依存できません。',
    cycle: (source: string, dependent: string): string =>
      `${source} は ${dependent} に依存しているため、循環する依存になります。`,
    lagNotNumber: 'ずらす時間は数で入力してください。',
    lagNegative: 'ずらす時間は 0 以上にしてください。',
  },

  labels: {
    remove: (label: string): string => `ラベル「${label}」を外す`,
    suggestions: (caption: string): string => `${caption}の候補`,
  },

  drafts: {
    titleRequired: 'タイトルを入力してください。',
    invalidDue: '期限の日時が正しくありません。',
    invalidEstimate: '見積は 0 以上の数で入力してください。',
    invalidDate: '日時が正しくありません。',
  },

  bulkEdit: {
    title: '一括編集',
    tasks: (count: number): string => `タスク ${count} 件`,
    milestones: (count: number): string => `マイルストーン ${count} 件`,
    lead: 'を変更します。「変更しない」の項目はそのままです。',
    milestonesHaveNoProgress: 'マイルストーンには進捗とラベルはありません。',
    addLabels: '追加するラベル',
    removeLabels: '外すラベル',
  },

  groups: {
    newGroup: '新しいグループ',
    name: 'グループ名',
    hint: 'DAG でノードを枠の中へドラッグするとグループに入り、枠の外へドラッグすると外れます。',
    confirmDelete: 'グループを削除しますか？（ノードは残ります）',
    nameRequired: 'グループ名を入力してください。',
  },

  projectFile: {
    title: 'プロジェクトを読み込む',
    replace: '置き換える',
    confirm: (
      fileName: string,
      tasks: number,
      milestones: number,
      groups: number,
    ): string =>
      `いまのプロジェクトを「${fileName}」の内容（タスク ${tasks}・マイルストーン ${milestones}・グループ ${groups}）で置き換えます。いまのタスク・マイルストーン・グループと DAG の配置はすべて消えます。置き換える前に、いまのプロジェクトをファイルに書き出します。`,
    refused: (fileName: string): string => `「${fileName}」は読み込めません。`,
    importing:
      '書き込み中です。閉じても書き込みは続きますが、終わる前にページを閉じたり、読み込み直したり、サインアウトしたりすると、置き換える前のタスクなどが消えずに残ることがあります。',
    stillLoading: 'まだ読み込み中です。少し待ってからもう一度どうぞ。',
    partlyLoaded:
      'プロジェクトの一部を読み込めなかったため、プロジェクト全体を扱えません。ページを読み込み直してください。',
    exportFailed: 'ファイルを書き出せませんでした。',
    exportWhileImporting:
      '読み込みの書き込みがまだ終わっていません。終わってから書き出してください。',
    languageWhileImporting:
      '読み込みの書き込み中は、言語を切り替えられません（ページを読み込み直すため）。',
    importWhileImporting:
      '前の読み込みの書き込みがまだ終わっていません。終わってからもう一度どうぞ。',
    importFailed: (fileName: string, backup: string): string =>
      `「${fileName}」の読み込みの途中で失敗しました。一部だけ書き換わっているかもしれません。直前に書き出した「${backup}」を読み込めば元に戻せます。`,
    notJson: 'JSON として読めません。',
    notProjectFile:
      'このアプリが書き出したプロジェクトのファイルではありません。',
    unknownVersion: (version: string, supported: number): string =>
      `形式の版 ${version} は読めません（読めるのは ${supported}）。`,
    malformed: 'プロジェクトのファイルの形が正しくありません。',
    record: (kind: string, index: number): string => `${kind} ${index} 件目`,
    missingId: (place: string): string => `${place}: id がありません。`,
    unusableId: (place: string, id: string): string =>
      `${place}: id「${id}」は使えません（空、「/」を含むもの、「.」「..」、「__」で始まり「__」で終わるもの、1300 バイトを超えるものは使えません）。`,
    recordTooLarge: (place: string): string =>
      `${place}: 大きすぎます（1 MB まで）。`,
    layout: (error: string): string => `DAG の配置: ${error}`,
    tooManyPositions: (max: number): string =>
      `DAG の配置: 位置が多すぎます（${max} まで）。`,
    unusablePosition: (key: string): string =>
      `DAG の配置: 「${key}」の位置は保存できません。`,
    layoutTooLarge: 'DAG の配置: 大きすぎます（1 MB まで）。',
    duplicateId: (kind: string, id: string, count: number): string =>
      `${kind}の id「${id}」が ${count} 回あります。`,
  },

  data: {
    loadFailed:
      'データを読み込めませんでした。権限の設定か接続を確認してください。',
    layoutLoadFailed: 'DAG の配置を読み込めませんでした。',
    groupsLoadFailed: 'グループを読み込めませんでした。',
    notSignedIn: (action: string): string =>
      `${action}できませんでした（サインインしていません）。`,
    failed: (action: string): string => `${action}できませんでした。`,
    saveTask: 'タスクを保存',
    saveMilestone: 'マイルストーンを保存',
    delete: '削除',
    saveGroup: 'グループを保存',
    deleteGroup: 'グループを削除',
    changeGroup: 'グループを変更',
    saveAll: 'まとめて保存',
    saveLayout: 'DAG の配置を保存',
    dependencyRefused: (reason: string): string =>
      `依存を追加できませんでした（${reason}）。`,
    refusals: {
      missing: 'タスクかマイルストーンが見つかりません',
      self: '自分自身には依存できません',
      duplicate: 'すでに依存しています',
      cycle: '循環する依存になります',
    },
  },
} as const;
