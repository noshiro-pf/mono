import { Optional } from 'ts-data-forge';
import { parseDateInputText } from './date-input-text.mjs';

describe(parseDateInputText, () => {
  test('reads a date written as the placeholder asks, YYYY-MM-DD, as that day here, not in UTC', () => {
    // West of UTC, where UTC midnight is the evening before.
    vi.stubEnv('TZ', 'America/New_York');

    onTestFinished(() => {
      // cspell:disable-next-line
      vi.unstubAllEnvs();
    });

    const parsed = parseDateInputText('2024-01-05');

    assert.isTrue(Optional.isSome(parsed));

    assert.deepStrictEqual(
      Optional.map(parsed, ({ year, month, day }): readonly number[] => [
        year,
        month,
        day,
      ]),
      Optional.some<readonly number[]>([2024, 1, 5]),
    );
  });

  test('reads no date from a month or day out of range, or from a date typed half way', () => {
    assert.deepStrictEqual(
      ['2024-13-01', '2024-01-32', '2024-12-0', '2024-12', '2024-'].map(
        (text) => Optional.isNone(parseDateInputText(text)),
      ),
      [true, true, true, true, true],
    );
  });

  test('keeps a typed time only where the input sets one, and reads forms with seconds as Date does', () => {
    const hm = (text: string, precision?: 'minute'): Optional<string> =>
      Optional.map(
        parseDateInputText(text, precision),
        ({ hour, minute }) => `${hour.toString()}:${minute.toString()}`,
      );

    assert.deepStrictEqual(
      [
        hm('2024-01-05 10:30'),
        hm('2024-01-05 10:30', 'minute'),
        hm('2024-01-05 10:30:00', 'minute'),
      ],
      [Optional.some('0:0'), Optional.some('10:30'), Optional.some('10:30')],
    );
  });

  test('reads the browser-written form, and nothing for what is not a date', () => {
    assert.isTrue(Optional.isSome(parseDateInputText('1/5/2024')));

    assert.isTrue(Optional.isNone(parseDateInputText('not a date')));
  });
});
