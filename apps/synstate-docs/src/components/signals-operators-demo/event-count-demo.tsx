/** @jsxImportSource preact */
import { batch, effect, signal } from '@preact/signals-core';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { createScope, createValueEmitter, scan } from 'synstate';
import type { Lang } from '../constants.mjs';
import { eventCountText as text } from './text.mjs';

type Props = Readonly<{ lang: Lang }>;

/**
 * Clicks counted twice: by an effect over a signal of the clicked item's id,
 * as Preact Signals has no `scan`, and by SynState's `scan` over an emitter.
 */
export const EventCountDemo = ({ lang }: Props): preact.JSX.Element => {
  const [generation, setGeneration] = useState(0);

  const [clicks, setClicks] = useState(0);

  const [preactCount, setPreactCount] = useState(0);

  const [synstateCount, setSynstateCount] = useState(0);

  // A ref rather than state, so that a click is never sent to the graphs a
  // reset has just disposed; built before paint, so that none is dropped.
  const mut_counters = useRef<Counters>(noCounters);

  useLayoutEffect(() => {
    setClicks(0);

    const preact = buildPreact(setPreactCount);

    const synstate = buildSynState(setSynstateCount);

    mut_counters.current = {
      click: (id) => {
        preact.click(id);

        synstate.click(id);
      },
      clickInOneBatch: (ids) => {
        preact.clickInOneBatch(ids);

        for (const id of ids) {
          synstate.click(id);
        }
      },
    };

    return () => {
      mut_counters.current = noCounters;

      preact.dispose();

      synstate.dispose();
    };
  }, [generation]);

  return (
    <div class={'signals-demo'}>
      <div class={'signals-demo-controls'}>
        <button
          type={'button'}
          onClick={() => {
            setClicks((n) => n + 1);

            mut_counters.current.click('A');
          }}
        >
          {text.clickA[lang]}
        </button>
        <button
          type={'button'}
          onClick={() => {
            setClicks((n) => n + 2);

            mut_counters.current.clickInOneBatch(['B', 'C']);
          }}
        >
          {text.clickBC[lang]}
        </button>
        <button
          type={'button'}
          onClick={() => {
            setGeneration((g) => g + 1);
          }}
        >
          {text.reset[lang]}
        </button>
      </div>
      <dl class={'signals-demo-counts'}>
        <div>
          <dt>{text.clicks[lang]}</dt>
          <dd>{clicks}</dd>
        </div>
        <div class={preactCount === clicks ? undefined : 'signals-demo-glitch'}>
          <dt>{text.preact[lang]}</dt>
          <dd>
            {preactCount}
            {preactCount === clicks ? undefined : (
              <span class={'signals-demo-badge'}>{text.lost[lang]}</span>
            )}
          </dd>
        </div>
        <div>
          <dt>{text.synstate[lang]}</dt>
          <dd>{synstateCount}</dd>
        </div>
      </dl>
      <p class={'signals-demo-caption'}>{text.caption[lang]}</p>
    </div>
  );
};

type Counters = Readonly<{
  click: (id: string) => void;
  clickInOneBatch: (ids: readonly string[]) => void;
}>;

const noCounters: Counters = {
  click: () => {},
  clickInOneBatch: () => {},
} as const;

const buildPreact = (
  onCount: (n: number) => void,
): Counters & Readonly<{ dispose: () => void }> => {
  const mut_clicked = signal<string | undefined>(undefined);

  const mut_clickCount = signal(0);

  // scan((n) => n + 1, 0), written as an effect.
  const disposeScan = effect(() => {
    if (mut_clicked.value !== undefined) {
      mut_clickCount.value = mut_clickCount.peek() + 1;
    }
  });

  const disposeView = effect(() => {
    onCount(mut_clickCount.value);
  });

  return {
    click: (id) => {
      mut_clicked.value = id;
    },
    clickInOneBatch: (ids) => {
      batch(() => {
        for (const id of ids) {
          mut_clicked.value = id;
        }
      });
    },
    dispose: () => {
      disposeScan();

      disposeView();
    },
  };
};

const buildSynState = (
  onCount: (n: number) => void,
): Readonly<{ click: (id: string) => void; dispose: () => void }> => {
  const scope = createScope();

  return scope.run(() => {
    const [clicked, click] = createValueEmitter<string>();

    clicked.pipe(scan((n) => n + 1, 0)).subscribe(onCount);

    return {
      click,
      dispose: () => {
        scope.dispose();
      },
    };
  });
};
