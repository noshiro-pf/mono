import { Optional } from 'ts-data-forge';
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

    assert.isFalse(Optional.unwrap(section.toggleState$.getSnapshot()));

    assert.isUndefined(Optional.unwrap(section.value$.getSnapshot()));
  });

  test('turning the section on sets the value given for that, as toggling it on does', () => {
    const section = createToggleSectionState<number | undefined>({
      initialToggleState: false,
      initialState: undefined,
      valueToBeSetWhenTurnedOff: () => undefined,
      valueToBeSetWhenTurnedOn: () => 0,
    });

    section.turnOn();

    assert.isTrue(Optional.unwrap(section.toggleState$.getSnapshot()));

    assert.strictEqual(Optional.unwrap(section.value$.getSnapshot()), 0);

    section.toggle();

    assert.isUndefined(Optional.unwrap(section.value$.getSnapshot()));

    section.toggle();

    assert.strictEqual(Optional.unwrap(section.value$.getSnapshot()), 0);
  });
});
