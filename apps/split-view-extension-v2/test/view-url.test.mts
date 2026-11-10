import {
  createPane,
  encodeQueryValue,
  formatViewQuery,
  initialWorkspace,
  maxPaneCount,
  paneIdsOf,
  paneLeaf,
  parseViewQuery,
  split,
  viewIdOf,
  workspaceReducer,
  type Workspace,
} from '../src/index.mjs';

describe('parseViewQuery', () => {
  test('a bare id asks for a stored view', () => {
    expect(parseViewQuery('?ws=abc')).toStrictEqual({
      id: 'abc',
      name: undefined,
      workspace: undefined,
    });
  });

  test('addresses past the most panes a split view has are left out', () => {
    const { workspace } = parseViewQuery(
      `?${Array.from({ length: maxPaneCount + 10 }, () => 'url=a.example').join('&')}`,
    );

    assert.isDefined(workspace);

    expect(paneIdsOf(workspace.root)).toHaveLength(maxPaneCount);
  });

  test('addresses with no layout go side by side', () => {
    const { workspace } = parseViewQuery(
      '?url=a.example&url=https%3A%2F%2Fb.example%2F&url=',
    );

    assert.isDefined(workspace);

    expect(paneIdsOf(workspace.root)).toStrictEqual([0, 1, 2]);

    expect(workspace.panes.map(({ url }) => url)).toStrictEqual([
      'https://a.example',
      'https://b.example/',
      '',
    ]);

    expect(workspace).toMatchObject({ nextPaneId: 3, activePaneId: 0 });
  });

  test('a preset id or a spec, zoom, sandbox, name and title', () => {
    const request = parseViewQuery(
      '?layout=rows-2&url=https://a.example/&zoom=1.5&zoom=9&sandbox=0&name=%20Mine%20&title=Board',
    );

    expect(request.name).toBe('Mine');

    assert.isDefined(request.workspace);

    expect(request.workspace.root).toStrictEqual(
      split('column', paneLeaf(0), paneLeaf(1)),
    );

    expect(
      request.workspace.panes.map(({ zoom, sandboxed }) => [zoom, sandboxed]),
    ).toStrictEqual([
      [1.5, false],
      [2, true],
    ]);

    expect(request.workspace.title).toBe('Board');
  });

  test('a layout that does not parse counts as none', () => {
    expect(parseViewQuery('?layout=zzz').workspace).toBeUndefined();
  });
});

describe('formatViewQuery', () => {
  test('writes addresses legibly and trims trailing empty panes', () => {
    const workspace = workspaceReducer(initialWorkspace(), {
      type: 'navigate',
      paneId: 1,
      input: 'https://a.example/x?y=1&z=2',
    });

    expect(formatViewQuery('w1', workspace)).toBe(
      '?ws=w1&layout=rcppcpp&url=&url=https://a.example/x%3Fy%3D1%26z%3D2',
    );
  });

  test('zoom and sandbox only when one pane differs', () => {
    const workspace: Workspace = {
      root: split('row', paneLeaf(0), paneLeaf(1)),
      panes: [
        { ...createPane(0, 'https://a.example/'), zoom: 1.25 },
        { ...createPane(1, 'https://b.example/'), sandboxed: false },
      ],
      nextPaneId: 2,
      activePaneId: 0,
      title: 'T',
    } as const;

    const query = formatViewQuery('w', workspace);

    expect(query).toBe(
      '?ws=w&title=T&layout=rpp&url=https://a.example/&url=https://b.example/&zoom=1.25&zoom=1&sandbox=1&sandbox=0',
    );

    const parsed = parseViewQuery(query).workspace;

    expect(
      parsed?.panes.map(({ url, zoom, sandboxed }) => [url, zoom, sandboxed]),
    ).toStrictEqual(
      workspace.panes.map(({ url, zoom, sandboxed }) => [url, zoom, sandboxed]),
    );
  });

  test('encodeQueryValue keeps : and / and escapes the rest', () => {
    expect(encodeQueryValue('https://a.example/?a=1&b=#c+%')).toBe(
      'https://a.example/%3Fa%3D1%26b%3D%23c%2B%25',
    );
  });

  test('viewIdOf', () => {
    expect(viewIdOf('?ws=x&url=y')).toBe('x');

    expect(viewIdOf('?ws=')).toBeUndefined();
  });
});
