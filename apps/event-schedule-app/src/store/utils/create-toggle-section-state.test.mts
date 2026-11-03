import { createToggleSectionState } from './create-toggle-section-state.mjs';

describe(createToggleSectionState, () => {
  test('turning the section off clears its value, as toggling it off does', () => {
    const section = createToggleSectionState<number | undefined>({
      initialToggleState: true,
      initialState: 1,
      valueToBeSetWhenTurnedOff: () => undefined,
    });

    section.setValue(2);

    section.turnOff();

    assert.isFalse(section.toggleState$.getSnapshot().value);

    assert.isUndefined(section.value$.getSnapshot().value);
  });

  test('turning the section on sets the value given for that, as toggling it on does', () => {
    const section = createToggleSectionState<number | undefined>({
      initialToggleState: false,
      initialState: undefined,
      valueToBeSetWhenTurnedOff: () => undefined,
      valueToBeSetWhenTurnedOn: () => 0,
    });

    section.turnOn();

    assert.isTrue(section.toggleState$.getSnapshot().value);

    assert.strictEqual(section.value$.getSnapshot().value, 0);

    section.toggle();

    assert.isUndefined(section.value$.getSnapshot().value);

    section.toggle();

    assert.strictEqual(section.value$.getSnapshot().value, 0);
  });
});
