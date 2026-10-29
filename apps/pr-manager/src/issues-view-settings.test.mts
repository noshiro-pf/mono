import {
  DEFAULT_ISSUES_VIEW_SETTINGS,
  issuesViewSettingsFromSearch,
  searchWithIssuesViewSettings,
} from './issues-view-settings.mjs';

describe(issuesViewSettingsFromSearch, () => {
  test('reads back what was written', () => {
    const settings = { view: 'dag' } as const;

    const search = searchWithIssuesViewSettings('', settings);

    assert.strictEqual(search, '?issues=dag');

    assert.deepStrictEqual(issuesViewSettingsFromSearch(search), settings);
  });

  test('anything it cannot make sense of is the list', () => {
    assert.deepStrictEqual(
      issuesViewSettingsFromSearch(''),
      DEFAULT_ISSUES_VIEW_SETTINGS,
    );

    assert.deepStrictEqual(
      issuesViewSettingsFromSearch('?issues=graph'),
      DEFAULT_ISSUES_VIEW_SETTINGS,
    );
  });
});

describe(searchWithIssuesViewSettings, () => {
  test('writes the default as no parameter, drops the DAG switches an older page wrote, and leaves the others where they were', () => {
    assert.strictEqual(
      searchWithIssuesViewSettings(
        '?a=1&issues=dag&dag.hideDone=1&dag.hidePending=1&b=2',
        DEFAULT_ISSUES_VIEW_SETTINGS,
      ),
      '?a=1&b=2',
    );
  });
});
