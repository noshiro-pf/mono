import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  persistedSetting,
  type PersistedSetting,
} from './persisted-setting.mjs';

const ColorCodec = t.enumType(['red', 'green', 'blue'], {
  defaultValue: 'green',
});

const color = persistedSetting(ColorCodec, { key: 'test:color' });

const PanelCodec = t.record({
  width: t.number(320),
  open: t.boolean(true),
  tabs: t.array(t.record({ name: t.string('main'), pinned: t.boolean() }), {
    defaultValue: [{ name: 'main', pinned: true }],
  }),
});

const panel = persistedSetting(PanelCodec, { key: 'test:panel' });

describe(persistedSetting, () => {
  test('keeps the key it was given, and is typed by its codec', () => {
    assert.strictEqual(color.key, 'test:color');

    assert.strictEqual(panel.key, 'test:panel');

    expectType<typeof color, PersistedSetting<'red' | 'green' | 'blue'>>('=');

    expectType<ReturnType<typeof panel.parse>, t.TypeOf<typeof PanelCodec>>(
      '=',
    );
  });

  describe('parse', () => {
    test('round-trips with serialize', () => {
      for (const each of ['red', 'green', 'blue'] as const) {
        assert.strictEqual(color.parse(color.serialize(each)), each);
      }

      const value = {
        width: 480,
        open: false,
        tabs: [
          { name: 'a', pinned: false },
          { name: 'b', pinned: true },
        ],
      } as const;

      assert.deepStrictEqual(panel.parse(panel.serialize(value)), value);
    });

    test("is the codec's default for nothing stored", () => {
      assert.strictEqual(color.parse(null), 'green');

      assert.deepStrictEqual(panel.parse(null), PanelCodec.defaultValue);
    });

    test("is the codec's default for what is not JSON", () => {
      for (const stored of ['', 'red', 'not json', '{', '{"width":1']) {
        assert.strictEqual(color.parse(stored), 'green');

        assert.deepStrictEqual(panel.parse(stored), PanelCodec.defaultValue);
      }
    });

    test("is the codec's default for JSON of another kind altogether", () => {
      for (const stored of ['"purple"', '1', 'null', '["red"]', '{}']) {
        assert.strictEqual(color.parse(stored), 'green');
      }

      for (const stored of ['"panel"', '1', 'null', 'true', '[]', '[{}]']) {
        assert.deepStrictEqual(panel.parse(stored), PanelCodec.defaultValue);
      }
    });

    test('keeps the valid fields of a record and defaults the broken ones', () => {
      assert.deepStrictEqual(
        panel.parse('{"width":480,"open":"yes","tabs":[]}'),
        { width: 480, open: true, tabs: [] },
      );

      assert.deepStrictEqual(
        panel.parse('{"width":"wide","open":false,"tabs":"all"}'),
        { width: 320, open: false, tabs: [{ name: 'main', pinned: true }] },
      );
    });

    test('defaults the fields that are missing', () => {
      assert.deepStrictEqual(panel.parse('{"open":false}'), {
        width: 320,
        open: false,
        tabs: [{ name: 'main', pinned: true }],
      });
    });

    test('repairs the elements of an array, field by field', () => {
      assert.deepStrictEqual(
        panel.parse(
          '{"width":480,"open":true,"tabs":[{"name":"a","pinned":"no"},{"pinned":true},7]}',
        ),
        {
          width: 480,
          open: true,
          tabs: [
            { name: 'a', pinned: false },
            { name: 'main', pinned: true },
            { name: 'main', pinned: false },
          ],
        },
      );
    });

    test('drops the fields the codec does not know, at any depth', () => {
      assert.deepStrictEqual(
        panel.parse(
          '{"width":480,"open":true,"tabs":[{"name":"a","pinned":true,"icon":"x"}],"zoom":2}',
        ),
        { width: 480, open: true, tabs: [{ name: 'a', pinned: true }] },
      );
    });

    test('normalizes every value it reads, the default included', () => {
      const sorted = persistedSetting(
        t.array(t.number(), { defaultValue: [3, 1] }),
        {
          key: 'test:sorted',
          normalize: (numbers) => numbers.toSorted((a, b) => a - b),
        },
      );

      assert.deepStrictEqual(sorted.parse('[2,1,3]'), [1, 2, 3]);

      assert.deepStrictEqual(sorted.parse(null), [1, 3]);

      assert.deepStrictEqual(sorted.parse('not json'), [1, 3]);
    });
  });

  describe('serialize', () => {
    test('writes the value as JSON', () => {
      assert.strictEqual(color.serialize('blue'), '"blue"');

      assert.strictEqual(
        panel.serialize({ width: 1, open: true, tabs: [] }),
        '{"width":1,"open":true,"tabs":[]}',
      );
    });

    test('writes nothing the codec does not know, at any depth', () => {
      const stray = {
        width: 1,
        open: true,
        tabs: [{ name: 'a', pinned: false, icon: 'x' }],
        zoom: 2,
      } as const;

      assert.strictEqual(
        panel.serialize(stray),
        '{"width":1,"open":true,"tabs":[{"name":"a","pinned":false}]}',
      );
    });
  });
});
