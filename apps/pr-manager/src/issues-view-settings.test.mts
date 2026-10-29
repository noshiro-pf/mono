import {
  DEFAULT_ISSUES_VIEW_SETTINGS,
  issuesViewSettingsFromSearch,
  searchWithIssuesViewSettings,
} from './issues-view-settings.mjs';

describe(issuesViewSettingsFromSearch, () => {
  test('reads back what was written', () => {
    const settings = {
      view: 'dag',
      hideDone: true,
      hidePending: true,
    } as const;

    const search = searchWithIssuesViewSettings('', settings);

    assert.strictEqual(search, '?issues=dag&dag.hideDone=1&dag.hidePending=1');

    assert.deepStrictEqual(issuesViewSettingsFromSearch(search), settings);
  });

  test('anything it cannot make sense of is the list, showing everything', () => {
    assert.deepStrictEqual(
      issuesViewSettingsFromSearch(''),
      DEFAULT_ISSUES_VIEW_SETTINGS,
    );

    assert.deepStrictEqual(
      issuesViewSettingsFromSearch(
        '?issues=graph&dag.hideDone=true&dag.hidePending=0',
      ),
      DEFAULT_ISSUES_VIEW_SETTINGS,
    );
  });
});

describe(searchWithIssuesViewSettings, () => {
  test('writes the default as no parameter, and leaves the others where they were', () => {
    assert.strictEqual(
      searchWithIssuesViewSettings(
        '?a=1&issues=dag&dag.hideDone=1&b=2',
        DEFAULT_ISSUES_VIEW_SETTINGS,
      ),
      '?a=1&b=2',
    );

    // The DAG's switches are kept while the list is shown.
    assert.strictEqual(
      searchWithIssuesViewSettings('', {
        ...DEFAULT_ISSUES_VIEW_SETTINGS,
        hidePending: true,
      }),
      '?dag.hidePending=1',
    );
  });
});
