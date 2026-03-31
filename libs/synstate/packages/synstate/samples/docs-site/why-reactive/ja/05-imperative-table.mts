/* transformer-ignore */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable total-functions/no-partial-division */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable import-x/unambiguous */
type Row = Readonly<{ name: string; email: string; gender: string }>;

const renderTable = (_rows: readonly Row[]): void => {};

const renderError = (_error: unknown): void => {};

// embed-sample-code-ignore-above
let filterName = '';
let filterEmail = '';
let filterGender = '';
let itemsPerPage = 10;
let currentPageInput = 1;
let allRows: readonly Row[] = [];

// 派生状態 — 手動で同期を維持する必要がある
let filteredRows: readonly Row[] = [];
let pageLength = 1;
let currentPage = 1;

// サーバーからテーブルデータを取得
const fetchData = async (): Promise<void> => {
  try {
    allRows = await fetch('/api/rows').then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    updateTable();
  } catch (error) {
    renderError(error);
  }
};

const updateTable = (): void => {
  filteredRows = allRows.filter(
    (row) =>
      row.name.includes(filterName) &&
      row.email.includes(filterEmail) &&
      row.gender.includes(filterGender),
  );

  pageLength = Math.ceil(filteredRows.length / itemsPerPage);

  currentPage = Math.min(currentPageInput, pageLength);

  const start = (currentPage - 1) * itemsPerPage;

  renderTable(filteredRows.slice(start, start + itemsPerPage));
};

// フィルタ変更時はページを1にリセットしてから更新（デバウンスは？）
const onFilterNameChange = (v: string): void => {
  filterName = v;
  currentPageInput = 1; // 忘れやすい！
  updateTable();
};

const onFilterEmailChange = (v: string): void => {
  filterEmail = v;
  currentPageInput = 1;
  updateTable();
};

const onFilterGenderChange = (v: string): void => {
  filterGender = v;
  currentPageInput = 1;
  updateTable();
};

const onItemsPerPageChange = (v: number): void => {
  itemsPerPage = v;
  currentPageInput = 1;
  updateTable();
};

const onPageChange = (v: number): void => {
  currentPageInput = v;
  updateTable();
};
// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(
  filterName,
  filterEmail,
  filterGender,
  itemsPerPage,
  currentPageInput,
  allRows,
  filteredRows,
  pageLength,
  currentPage,
  fetchData,
  updateTable,
  onFilterNameChange,
  onFilterEmailChange,
  onFilterGenderChange,
  onItemsPerPageChange,
  onPageChange,
);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
