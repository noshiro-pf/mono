import { defineMachine } from 'ts-fsm-forge';

if (import.meta.vitest !== undefined) {
  test('another discriminating property', () => {
    // embed-sample-code-ignore-above
    type Door = Readonly<{ kind: 'closed' } | { kind: 'open'; by: string }>;

    type DoorAction = Readonly<
      { kind: 'close' } | { kind: 'open'; by: string }
    >;

    // The property is named twice: as a type for the compiler, and as a string
    // for the machine to read. Naming one without the other does not compile.
    const door = defineMachine<Door, DoorAction, 'kind'>('kind')(
      { closed: { open: 'open' }, open: { close: 'closed' } },
      {
        closed: { open: (_s, a) => ({ kind: 'open', by: a.by }) },
        open: { close: () => ({ kind: 'closed' }) },
      },
    );

    assert.deepStrictEqual(
      door.reducer({ kind: 'closed' }, { kind: 'open', by: 'me' }),
      { kind: 'open', by: 'me' },
    );
    // embed-sample-code-ignore-below
  });
}
