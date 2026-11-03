// cspell:ignore unstub
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { eventScheduleInitialValue } from '../constants/index.mjs';
import { EventScheduleAppLocalStorage } from './local-storage.mjs';

describe('EventScheduleAppLocalStorage when the browser blocks site storage', () => {
  test('restoreCreateEventPageTemp returns an error rather than throwing', () => {
    stubWindow({
      get localStorage(): Storage {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
    });

    const result = EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

    assert.isTrue(Result.isErr(result));

    expect(result.value).toBe('SecurityError: The operation is insecure.');
  });

  test('saveCreateEventPageTemp returns an error rather than throwing', () => {
    stubWindow({
      localStorage: storageWith({
        getItem: () => null,
        setItem: () => {
          throw new DOMException(
            'The quota has been exceeded.',
            'QuotaExceededError',
          );
        },
      }),
    });

    const result = EventScheduleAppLocalStorage.saveCreateEventPageTemp(
      eventScheduleInitialValue,
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toBe(
      'QuotaExceededError: The quota has been exceeded.',
    );
  });
});

describe('EventScheduleAppLocalStorage with working storage', () => {
  test('restores nothing from empty storage', () => {
    stubWindow({
      localStorage: storageWith({ getItem: () => null, setItem: () => {} }),
    });

    const restored = EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

    assert.isTrue(Result.isOk(restored));

    expect(restored.value).toBeUndefined();
  });

  test('returns an error for a stored value that is not JSON', () => {
    stubWindow({
      localStorage: storageWith({ getItem: () => '{', setItem: () => {} }),
    });

    assert.isTrue(
      Result.isErr(EventScheduleAppLocalStorage.restoreCreateEventPageTemp()),
    );
  });

  test('restores what it saved', () => {
    const mut_items = new Map<string, string>();

    stubWindow({
      localStorage: storageWith({
        getItem: (key) => mut_items.get(key) ?? null,
        setItem: (key, value) => {
          mut_items.set(key, value);
        },
      }),
    });

    assert.isTrue(
      Result.isOk(
        EventScheduleAppLocalStorage.saveCreateEventPageTemp(
          eventScheduleInitialValue,
        ),
      ),
    );

    const restored = EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

    assert.isTrue(Result.isOk(restored));

    expect(restored.value?.title).toBe(eventScheduleInitialValue.title);
  });
});

const stubWindow = (win: unknown): void => {
  vi.stubGlobal('window', win);

  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
};

const storageWith = ({
  getItem,
  setItem,
}: StrictPick<Storage, 'getItem' | 'setItem'>): Storage =>
  ({
    length: 0,
    clear: () => {},
    getItem,
    key: () => null,
    removeItem: () => {},
    setItem,
  }) as const;
