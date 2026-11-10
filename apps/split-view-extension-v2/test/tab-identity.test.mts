import {
  accentColorOf,
  createPane,
  faviconLabelOf,
  iconPaneBoundsOf,
  paneLeaf,
  split,
  tabLabelOf,
  tabTitleOf,
  type Workspace,
} from '../src/index.mjs';

const workspace: Workspace = {
  root: split('row', paneLeaf(1), paneLeaf(0)),
  panes: [
    createPane(0),
    {
      ...createPane(1),
      live: {
        currentUrl: 'https://a.example/',
        title: 'First in tree order',
        historyLength: 1,
        reloadToken: 0,
      },
    },
  ],
  nextPaneId: 2,
  activePaneId: 0,
  title: undefined,
} as const;

describe('tab identity', () => {
  test('title: number first, then the view title, a pane title, or the name', () => {
    expect(tabTitleOf(3, 'X')).toBe('3: X');

    expect(tabLabelOf(workspace, 'Name')).toBe('First in tree order');

    expect(tabLabelOf({ ...workspace, title: 'Board' }, 'Name')).toBe('Board');

    expect(tabLabelOf({ ...workspace, panes: [] }, 'Name')).toBe('Name');
  });

  test('colours cycle by position', () => {
    expect(accentColorOf(1)).toBe(accentColorOf(9));

    expect(accentColorOf(1)).not.toBe(accentColorOf(2));
  });

  test('icon panes snap to whole pixels', () => {
    expect(iconPaneBoundsOf(16)).toStrictEqual([3, 7, 9, 13]);

    expect(iconPaneBoundsOf(128).every(Number.isInteger)).toBe(true);
  });

  test('more digits, a smaller font', () => {
    expect(faviconLabelOf(7)).toStrictEqual({ label: '7', fontPx: 24 });

    expect(faviconLabelOf(12)).toStrictEqual({ label: '12', fontPx: 18 });

    expect(faviconLabelOf(123).fontPx).toBe(13);
  });
});
