import { DEFAULT_ISSUES_LIST_VIEW } from './issues-list-view.mjs';
import {
  githubIssuesSearchOf,
  githubIssuesSearchTitle,
  type IssuesSearch,
} from './issues-search.mjs';

describe(githubIssuesSearchOf, () => {
  test('with nothing switched off, picked or typed, is every open issue', () => {
    assert.deepStrictEqual(searchFor({}), {
      qualifiers: [],
      unsearchable: [],
      isPrerequisiteLeftOut: false,
    });
  });

  test('a tier switched off is its label negated', () => {
    assert.deepStrictEqual(
      searchFor({ hiddenPriorities: ['hold', 'close'] }).qualifiers,
      ['-label:"priority:hold"', '-label:"priority:close"'],
    );
  });

  test('"none" switched off asks for one of the tier labels', () => {
    assert.deepStrictEqual(
      searchFor({ hiddenPriorities: ['none'] }).qualifiers,
      [
        'label:"priority:S","priority:A","priority:B","priority:C","priority:D","priority:hold","priority:close"',
      ],
    );
  });

  test('tiers picked are one label qualifier, which GitHub reads as any of them', () => {
    assert.deepStrictEqual(
      searchFor({ onlyPriorities: ['S', 'A'] }).qualifiers,
      ['label:"priority:S","priority:A"'],
    );
  });

  test('"none" picked alone is every tier label negated, once each', () => {
    assert.deepStrictEqual(
      searchFor({ onlyPriorities: ['none'], hiddenPriorities: ['hold'] })
        .qualifiers,
      [
        '-label:"priority:hold"',
        '-label:"priority:S"',
        '-label:"priority:A"',
        '-label:"priority:B"',
        '-label:"priority:C"',
        '-label:"priority:D"',
        '-label:"priority:close"',
      ],
    );
  });

  test('"none" picked with a tier is no search GitHub has, and is said to be', () => {
    assert.deepStrictEqual(searchFor({ onlyPriorities: ['S', 'none'] }), {
      qualifiers: [],
      unsearchable: ['the tiers picked'],
      isPrerequisiteLeftOut: false,
    });
  });

  test('labels picked are one quoted label qualifier', () => {
    assert.deepStrictEqual(
      searchFor({ onlyLabels: ['bug', 'good first issue'] }).qualifiers,
      ['label:"bug","good first issue"'],
    );
  });

  test('in progress, the start states and the search are left to the page, and said to be', () => {
    assert.deepStrictEqual(
      githubIssuesSearchOf(
        {
          ...DEFAULT_ISSUES_LIST_VIEW,
          hideInProgress: true,
          hiddenStarts: ['blocked'],
        },
        ' zoo ',
        'list',
      ),
      {
        qualifiers: [],
        unsearchable: [
          'in progress',
          'start state',
          'the search by title or number',
        ],
        isPrerequisiteLeftOut: false,
      },
    );
  });

  test('the DAG reads the tiers and in progress alone, and draws what they wait on', () => {
    assert.deepStrictEqual(
      githubIssuesSearchOf(
        {
          ...DEFAULT_ISSUES_LIST_VIEW,
          hiddenPriorities: ['close'],
          onlyInProgress: true,
          hiddenStarts: ['blocked'],
          onlyLabels: ['bug'],
        },
        'dag',
        'dag',
      ),
      {
        qualifiers: ['-label:"priority:close"'],
        unsearchable: ['in progress'],
        isPrerequisiteLeftOut: true,
      },
    );
  });

  test('the DAG draws what the issues wait on, filtered or not', () => {
    assert.isTrue(
      githubIssuesSearchOf(DEFAULT_ISSUES_LIST_VIEW, '', 'dag')
        .isPrerequisiteLeftOut,
    );
  });
});

describe(githubIssuesSearchTitle, () => {
  test('says what GitHub cannot narrow by, and what the DAG draws besides', () => {
    assert.strictEqual(
      githubIssuesSearchTitle({
        qualifiers: [],
        unsearchable: ['in progress', 'start state'],
        isPrerequisiteLeftOut: true,
      }),
      "The open issues as the filters leave them, most recently updated first. GitHub's search cannot narrow by “in progress”, “start state”, so it lists more. The DAG also draws what the issues wait on, which it can leave out.",
    );
  });

  test('with nothing left out, says only what it lists', () => {
    assert.strictEqual(
      githubIssuesSearchTitle({
        qualifiers: [],
        unsearchable: [],
        isPrerequisiteLeftOut: false,
      }),
      'The open issues as the filters leave them, most recently updated first.',
    );
  });
});

const searchFor = (
  view: Partial<typeof DEFAULT_ISSUES_LIST_VIEW>,
): IssuesSearch =>
  githubIssuesSearchOf({ ...DEFAULT_ISSUES_LIST_VIEW, ...view }, '', 'list');
