// TagInput and RangeSlider beside Blueprint React's, driven alike: what each
// asks the app for, and what it draws as it goes, must be the same.
import * as Blueprint from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import {
  BpText,
  RangeSlider,
  Tag,
  TagInput,
  type NumberRange,
  type TagInputAddMethod,
  type TagInputValue,
} from 'blueprint-synstate';
import { createElement as h, useState } from 'react';
import { createState } from 'synstate';
import { constant, mapBindable, render } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { userEvent } from 'vitest/browser';
import { mountBlueprint } from './blueprint-cases.js';
import { mountInto, nextFrame, settle } from './helpers.mjs';
import { stage } from './stage.mjs';

/** What a side asked for, in order, and what it drew after each step. */
type Log = readonly string[];

/** Mounts a side on `host`; what it asks the app for goes to `log`. */
type Mount = (on: HTMLElement, log: (entry: string) => void) => () => void;

/** What the test does to a side once mounted. */
type Steps = (on: HTMLElement, log: (entry: string) => void) => Promise<void>;

/**
 * Mounts each side on its own stage, runs `steps` on it, and returns the two
 * logs, Blueprint's first.
 */
const bothRun = async (
  mountTheirs: Mount,
  mountOurs: Mount,
  steps: Steps,
): Promise<readonly [theirs: Log, ours: Log]> => {
  const run = async (mount: Mount): Promise<Log> => {
    const host = stage();

    const mut_log: string[] = [];

    const log = (entry: string): void => {
      mut_log.push(entry);
    };

    const unmount = mount(host, log);

    try {
      await settle();

      await steps(host, log);
    } finally {
      unmount();

      host.remove();
    }

    return mut_log;
  };

  const theirs = await run(mountTheirs);

  const ours = await run(mountOurs);

  return [theirs, ours];
};

/** A line of `drawn` without the mark of the tag moved to. */
const unmarked = (line: string): string => line.replace(/\[([^\]]*)\]/u, '$1');

describe('TagInput beside Blueprint React', () => {
  test('adds what is typed, split and trimmed, and moves through and removes tags by the keys', async () => {
    const [blueprint, synstate] = await bothRun(
      theirTagInput({ initial: ['fig'] }),
      ourTagInput({ initial: ['fig'] }),
      async (host, log) => {
        const keys = [
          'apple , pear,,{Enter}',
          '{ArrowLeft}',
          '{ArrowLeft}',
          '{ArrowRight}',
          '{Delete}',
          '{Backspace}',
          '{Backspace}',
          '{ArrowLeft}',
          '{ArrowRight}',
          '{ArrowRight}',
          'k{Backspace}{ArrowLeft}',
        ] as const;

        await userEvent.click(host.querySelector('input') ?? host);

        await keys.reduce(async (before, key) => {
          await before;

          await userEvent.keyboard(key);

          await settle();

          log(tagsDrawn(host));
        }, Promise.resolve());
      },
    );

    // Blueprint 6 draws no tag as moved to, since a tag that is not interactive
    // ignores `active`; this library draws it (see the README).
    assert.deepStrictEqual(synstate.map(unmarked), blueprint);

    assert.include(blueprint, 'add apple|pear by default');

    assert.deepStrictEqual(synstate.slice(2, 5), [
      'fig apple [pear] "" focused',
      'fig [apple] pear "" focused',
      'fig apple [pear] "" focused',
    ]);
  });

  test('adds what was typed as focus leaves, with addOnBlur', async () => {
    const [blueprint, synstate] = await bothRun(
      theirTagInput({ initial: [], addOnBlur: true }),
      ourTagInput({ initial: [], addOnBlur: true }),
      async (host, log) => {
        await userEvent.click(host.querySelector('input') ?? host);

        await userEvent.keyboard('kiwi');

        log(tagsDrawn(host));

        await userEvent.click(document.body, { position: { x: 1, y: 1 } });

        await nextFrame();

        await settle();

        log(tagsDrawn(host));
      },
    );

    assert.deepStrictEqual(synstate, blueprint);

    assert.include(blueprint, 'add kiwi by blur');
  });

  test('adds what is pasted with a separator in it, and leaves one value to be typed on', async () => {
    const [blueprint, synstate] = await bothRun(
      theirTagInput({ initial: [] }),
      ourTagInput({ initial: [] }),
      async (host, log) => {
        const input = host.querySelector('input');

        assert.isNotNull(input);

        await userEvent.click(input);

        for (const text of ['plum, lime', 'melon']) {
          const data = new DataTransfer();

          data.setData('text', text);

          const event = new ClipboardEvent('paste', {
            clipboardData: data,
            bubbles: true,
            cancelable: true,
          });

          input.dispatchEvent(event);

          // eslint-disable-next-line no-await-in-loop -- one paste after the other
          await settle();

          log(
            `${tagsDrawn(host)} ${event.defaultPrevented ? 'taken' : 'left'}`,
          );
        }
      },
    );

    assert.deepStrictEqual(synstate, blueprint);

    assert.include(blueprint, 'add plum|lime by paste');
  });
});

describe(TagInput, () => {
  test("calls a tag's own onRemove from its remove button, and the input's from the keys", async () => {
    const mut_removed: string[] = [];

    const { container, unmount } = mountInto(() => (
      <TagInput
        values={constant([
          {
            value: 'Mine',
            onRemove: () => {
              mut_removed.push('own');
            },
          },
        ])}
        onRemove={(value) => {
          mut_removed.push(`input ${value}`);
        }}
      />
    ));

    onTestFinished(unmount);

    const remove = container.querySelector('.bp6-tag-remove');

    assert.instanceOf(remove, HTMLElement);

    await userEvent.click(remove);

    await userEvent.click(container.querySelector('input') ?? container);

    await userEvent.keyboard('{ArrowLeft}{Delete}');

    assert.deepStrictEqual(mut_removed, ['own', 'input Mine']);
  });

  test('draws no remove button while disabled, and its placeholder only while it has no tag', async () => {
    const [disabled$, setDisabled] = createState(false);

    const [values$, setValues] = createState<readonly TagInputValue[]>([]);

    const { container, unmount } = mountInto(() => (
      <TagInput
        disabled={disabled$}
        placeholder={'Add a fruit'}
        values={values$}
      />
    ));

    onTestFinished(unmount);

    const input = container.querySelector('input');

    assert.isNotNull(input);

    assert.strictEqual(input.placeholder, 'Add a fruit');

    setValues([{ value: 'Apples' }]);

    await settle();

    assert.strictEqual(input.placeholder, '');

    assert.strictEqual(container.querySelectorAll('.bp6-tag-remove').length, 1);

    setDisabled(true);

    await settle();

    assert.strictEqual(container.querySelectorAll('.bp6-tag-remove').length, 0);

    assert.isTrue(input.disabled);
  });

  test("puts a tag's data-e2e on its span, and on no other", () => {
    const { container, unmount } = mountInto(() => (
      <TagInput
        values={constant([
          { value: 'Marked', 'data-e2e': 'marked-tag' },
          { value: 'Plain' },
        ])}
      />
    ));

    onTestFinished(unmount);

    const tags = Array.from(container.querySelectorAll('span.bp6-tag'));

    assert.deepStrictEqual(
      tags.map((tag) =>
        tag instanceof HTMLElement ? tag.dataset['e2e'] : undefined,
      ),
      ['marked-tag', undefined],
    );
  });
});

describe('RangeSlider beside Blueprint React', () => {
  test('moves a handle by the arrow keys, and stops it at the other', async () => {
    const [blueprint, synstate] = await bothRun(
      theirSlider([3, 5]),
      ourSlider([3, 5]),
      async (host, log) => {
        const [start, end] = host.querySelectorAll('.bp6-slider-handle');

        assert.instanceOf(start, HTMLElement);

        assert.instanceOf(end, HTMLElement);

        log(handlesDrawn(host));

        start.focus();

        await userEvent.keyboard('{ArrowRight}{ArrowUp}{ArrowRight}');

        await settle();

        log(handlesDrawn(host));

        end.focus();

        await userEvent.keyboard('{ArrowDown}{ArrowLeft}{ArrowRight}');

        await settle();

        log(handlesDrawn(host));

        await userEvent.keyboard('{ArrowRight>12/}');

        await settle();

        log(handlesDrawn(host));
      },
    );

    assert.deepStrictEqual(synstate, blueprint);

    assert.include(blueprint, 'change 4-5');
  });

  test('drags a handle, and the one nearest a press on the track', async () => {
    const [blueprint, synstate] = await bothRun(
      theirSlider([2, 6], 0.5),
      ourSlider([2, 6], 0.5),
      async (host, log) => {
        const [start] = host.querySelectorAll('.bp6-slider-handle');

        const track = host.querySelector('.bp6-slider-track');

        assert.instanceOf(start, HTMLElement);

        assert.isNotNull(track);

        const steps: readonly (readonly [
          target: EventTarget,
          type: 'mousedown' | 'mousemove' | 'mouseup',
          value: number,
        ])[] = [
          // The start handle, dragged past the end, which stops it, and back.
          [start, 'mousedown', 2],
          [document, 'mousemove', 3.6],
          [document, 'mousemove', 8],
          [document, 'mousemove', 4],
          [document, 'mouseup', 4],
          // A press nearer the end handle, which is dragged there.
          [track, 'mousedown', 9],
          [document, 'mousemove', 7.7],
          [document, 'mouseup', 7.7],
          // A press nearer the start.
          [track, 'mousedown', 1],
          [document, 'mouseup', 1],
        ] as const;

        await steps.reduce(async (before, [target, type, value]) => {
          await before;

          mouse(target, type, xOf(host, value));

          // React draws what a document listener asks for in a later task.
          await nextFrame();

          await settle();

          log(`${type} ${handlesDrawn(host)}`);
        }, Promise.resolve());
      },
    );

    assert.deepStrictEqual(synstate, blueprint);

    assert.include(blueprint, 'release 1-7.5');
  });
});

describe(RangeSlider, () => {
  test('asks for nothing, and is not dragged, while disabled', async () => {
    const mut_asked: string[] = [];

    const { container, unmount } = mountInto(() => (
      <div style={{ width: constant('400px') }}>
        <RangeSlider
          disabled={constant(true)}
          value={constant([2, 6] as const)}
          onChange={(next) => {
            mut_asked.push(`change ${next.join('-')}`);
          }}
          onRelease={(next) => {
            mut_asked.push(`release ${next.join('-')}`);
          }}
        />
      </div>
    ));

    onTestFinished(unmount);

    const track = container.querySelector('.bp6-slider-track');

    const [start] = container.querySelectorAll('.bp6-slider-handle');

    assert.isNotNull(track);

    assert.instanceOf(start, HTMLElement);

    const { left, width } = track.getBoundingClientRect();

    track.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: left + width / 2 }),
    );

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: left }));

    start.focus();

    await userEvent.keyboard('{ArrowRight}');

    assert.deepStrictEqual(mut_asked, []);

    assert.strictEqual(start.getAttribute('aria-disabled'), 'true');
  });
});

describe(`${RangeSlider.name}, beyond Blueprint's cases`, () => {
  test('refuses bounds that are not finite, both label options, steps that are not above 0, and more labels than can be drawn', () => {
    assert.throws(() => {
      RangeSlider({
        value: constant([0, 1] as const),
        max: Number.POSITIVE_INFINITY,
      });
    }, /min and max must be finite/u);

    assert.throws(() => {
      RangeSlider({
        value: constant([0, 1] as const),
        labelStepSize: 2,
        labelValues: [0, 5],
      });
    }, /cannot both be given/u);

    // A step that adds nothing to bounds this large.
    assert.throws(() => {
      RangeSlider({
        value: constant([1e16, 1e16] as const),
        min: 1e16,
        max: 1e16 + 10,
      });
    }, /more than 1000 labels/u);

    assert.throws(() => {
      RangeSlider({ value: constant([0, 1] as const), stepSize: 0 });
    }, /stepSize must be above 0/u);

    assert.throws(() => {
      RangeSlider({ value: constant([0, 1] as const), labelStepSize: -1 });
    }, /labelStepSize must be above 0/u);
  });

  test('places its handles once a slider drawn hidden is shown', async () => {
    const [isShown$, setIsShown] = createState(false);

    const { container, unmount } = mountInto(() => (
      <div
        style={{
          display: mapBindable(isShown$, (isShown) =>
            isShown ? 'block' : 'none',
          ),
          width: constant('400px'),
        }}
      >
        <RangeSlider value={constant([2, 6] as const)} />
      </div>
    ));

    onTestFinished(unmount);

    await nextFrame();

    setIsShown(true);

    await nextFrame();

    await nextFrame();

    assert.deepStrictEqual(
      Array.from(
        container.querySelectorAll<HTMLElement>('.bp6-slider-handle'),
        (handle) => handle.style.left,
      ),
      ['calc(20% - 8px)', 'calc(60% - 8px)'],
    );
  });

  test('fills the track between the ends of a reversed range', () => {
    const { container, unmount } = mountInto(() => (
      <RangeSlider value={constant([7, 3] as const)} />
    ));

    onTestFinished(unmount);

    assert.deepStrictEqual(
      Array.from(
        container.querySelectorAll<HTMLElement>('.bp6-slider-progress'),
        ({ style }) => `${style.left} ${style.right}`,
      ),
      ['0% 70%', '30% 30%', '70% 0%'],
    );
  });

  test('moves the handle nearest a tap on the track', async () => {
    const mut_released: string[] = [];

    const { container, unmount } = mountInto(() => (
      <div style={{ width: constant('400px') }}>
        <RangeSlider
          value={constant([2, 6] as const)}
          onRelease={(next) => {
            mut_released.push(next.join('-'));
          }}
        />
      </div>
    ));

    onTestFinished(unmount);

    await settle();

    const track = container.querySelector('.bp6-slider-track');

    assert.isNotNull(track);

    const { left, width } = track.getBoundingClientRect();

    const touch = new Touch({
      identifier: 1,
      target: track,
      clientX: left + width / 2,
    });

    track.dispatchEvent(
      new TouchEvent('touchstart', {
        bubbles: true,
        changedTouches: [touch],
        touches: [touch],
      }),
    );

    track.dispatchEvent(
      new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [touch],
      }),
    );

    // The end handle, nearer the middle, moved to it.
    assert.deepStrictEqual(mut_released, ['2-5']);
  });
});

describe(BpText, () => {
  test('titles its text with all of it while it is cut short, and follows the text', async () => {
    const [text$, setText] = createState('Short');

    const { container, unmount } = mountInto(() => (
      <div style={{ width: constant('120px') }}>
        <BpText ellipsize={true}>{text$}</BpText>
      </div>
    ));

    onTestFinished(unmount);

    const text = container.querySelector('.bp6-text-overflow-ellipsis');

    assert.instanceOf(text, HTMLElement);

    await settle();

    assert.isNull(text.getAttribute('title'));

    setText('A line far too long to fit in the box');

    await settle();

    assert.strictEqual(
      text.getAttribute('title'),
      'A line far too long to fit in the box',
    );
  });

  test('titles its text once it is shown cut short', async () => {
    const [isShown$, setIsShown] = createState(false);

    const { container, unmount } = mountInto(() => (
      <div
        style={{
          display: mapBindable(isShown$, (isShown) =>
            isShown ? 'block' : 'none',
          ),
          width: constant('120px'),
        }}
      >
        <BpText ellipsize={true}>
          {constant('A line far too long to fit in the box')}
        </BpText>
      </div>
    ));

    onTestFinished(unmount);

    await nextFrame();

    const text = container.querySelector('.bp6-text-overflow-ellipsis');

    assert.instanceOf(text, HTMLElement);

    assert.isNull(text.getAttribute('title'));

    setIsShown(true);

    await nextFrame();

    await nextFrame();

    assert.strictEqual(
      text.getAttribute('title'),
      'A line far too long to fit in the box',
    );
  });
});

describe(Tag, () => {
  test('calls onRemove from its remove button', async () => {
    const mut_removed: string[] = [];

    const { container, unmount } = mountInto(() => (
      <Tag
        onRemove={(event) => {
          mut_removed.push(event.type);
        }}
      >
        {constant('Alice')}
      </Tag>
    ));

    onTestFinished(unmount);

    const remove = container.querySelector('.bp6-tag-remove');

    assert.instanceOf(remove, HTMLElement);

    await userEvent.click(remove);

    assert.deepStrictEqual(mut_removed, ['click']);
  });
});

/** The tags drawn, the one moved to in brackets, and the text typed. */
const tagsDrawn = (host: HTMLElement): string =>
  [
    ...Array.from(host.querySelectorAll('.bp6-tag'), (tag) =>
      tag.classList.contains('bp6-active')
        ? `[${tag.textContent}]`
        : tag.textContent,
    ),
    `"${host.querySelector('input')?.value ?? ''}"`,
    host.querySelector('.bp6-tag-input')?.classList.contains('bp6-active') ===
    true
      ? 'focused'
      : 'blurred',
  ].join(' ');

const theirTagInput =
  (props: Readonly<{ addOnBlur?: boolean; initial: readonly string[] }>) =>
  (host: HTMLElement, log: (entry: string) => void): (() => void) =>
    mountBlueprint(() => {
      const App = (): ReturnType<typeof h> => {
        const [values, setValues] = useState(props.initial);

        return h(Blueprint.TagInput, {
          values,
          addOnBlur: props.addOnBlur ?? false,
          onAdd: (added, method) => {
            log(`add ${added.join('|')} by ${method}`);

            setValues((before) => [...before, ...added]);
          },
          onRemove: (value, index) => {
            log(
              `remove ${typeof value === 'string' ? value : ''} at ${index.toString()}`,
            );

            setValues((before) => before.filter((_, i) => i !== index));
          },
        });
      };

      return h(App);
    }, host);

const ourTagInput =
  (props: Readonly<{ addOnBlur?: boolean; initial: readonly string[] }>) =>
  (host: HTMLElement, log: (entry: string) => void): (() => void) => {
    const [values$, setValues] = createState<readonly TagInputValue[]>(
      props.initial.map((value) => ({ value })),
    );

    return render(
      () => (
        <TagInput
          addOnBlur={props.addOnBlur ?? false}
          values={values$}
          onAdd={(added: readonly string[], method: TagInputAddMethod) => {
            log(`add ${added.join('|')} by ${method}`);

            setValues([
              ...Optional.unwrap(values$.getSnapshot()),
              ...added.map((value) => ({ value })),
            ]);
          }}
          onRemove={(value, index) => {
            log(`remove ${value} at ${index.toString()}`);

            setValues(
              Optional.unwrap(values$.getSnapshot()).filter(
                (_, i) => i !== index,
              ),
            );
          }}
        />
      ),
      host,
    );
  };

const sliderWidth = 400;

const theirSlider =
  (initial: NumberRange, stepSize = 1) =>
  (host: HTMLElement, log: (entry: string) => void): (() => void) =>
    mountBlueprint(() => {
      const App = (): ReturnType<typeof h> => {
        const [value, setValue] = useState<Blueprint.NumberRange>([
          initial[0],
          initial[1],
        ]);

        return h(
          'div',
          { style: { width: `${sliderWidth.toString()}px` } },
          h(Blueprint.RangeSlider, {
            value,
            stepSize,
            onChange: (next) => {
              log(`change ${next.join('-')}`);

              setValue(next);
            },
            onRelease: (next) => {
              log(`release ${next.join('-')}`);
            },
          }),
        );
      };

      return h(App);
    }, host);

const ourSlider =
  (initial: NumberRange, stepSize = 1) =>
  (host: HTMLElement, log: (entry: string) => void): (() => void) => {
    const [value$, setValue] = createState<NumberRange>(initial);

    return render(
      () => (
        <div style={{ width: constant(`${sliderWidth.toString()}px`) }}>
          <RangeSlider
            stepSize={stepSize}
            value={value$}
            onChange={(next) => {
              log(`change ${next.join('-')}`);

              setValue(next);
            }}
            onRelease={(next) => {
              log(`release ${next.join('-')}`);
            }}
          />
        </div>
      ),
      host,
    );
  };

/** The handles' values and places, and which one is being dragged. */
const handlesDrawn = (host: HTMLElement): string =>
  Array.from(
    host.querySelectorAll<HTMLElement>('.bp6-slider-handle'),
    (handle) =>
      `${handle.getAttribute('aria-valuenow') ?? ''}@${handle.style.left}${handle.classList.contains('bp6-active') ? '*' : ''}`,
  ).join(' ');

/** The x of `value` on the track, from 0 to 10. */
const xOf = (host: HTMLElement, value: number): number => {
  const track = host.querySelector('.bp6-slider-track');

  assert.isNotNull(track);

  const { left, width } = track.getBoundingClientRect();

  return left + (width * value) / 10;
};

const mouse = (
  target: EventTarget,
  type: 'mousedown' | 'mousemove' | 'mouseup',
  clientX: number,
): void => {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, clientX, clientY: 0 }),
  );
};
