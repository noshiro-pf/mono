import * as React from 'react';
import { Arr } from 'ts-data-forge';
import type { Lang } from '../constants.mjs';
import {
  traceNodesOf,
  traceUpdates,
  type TraceScenarioName,
} from './simulate-trace.mjs';
import { StableCaption } from './stable-caption.jsx';
import { TraceCode } from './trace-code.jsx';
import { TraceDialog } from './trace-dialog.jsx';
import { TraceGraph } from './trace-graph.jsx';
import { TraceLocalsPanel } from './trace-locals-panel.jsx';
import { TraceModulePanel } from './trace-module-panel.jsx';
import { TraceNodesTable } from './trace-nodes-table.jsx';
import { TraceQueuePanel } from './trace-queue-panel.jsx';
import {
  colors,
  monoFont,
  mutedStyle,
  nodeFields,
  type Graph,
} from './trace-shared.mjs';
import type { TraceNode, TraceStep } from './trace-step.mjs';

type Props = Readonly<{
  scenario: TraceScenarioName;
  /** Which of the scenario's writes to step through, from 1. */
  update: number;
  lang: Lang;
}>;

/**
 * Steps through one update as synstate runs it, showing every field the
 * propagation reads or writes: the module state and its buckets, the queues
 * of the updates open, the locals, and each node's token and mark.
 */
export const PropagationTrace = React.memo<Props>((props) => {
  const { scenario, update, lang } = props;

  const steps = React.useMemo(
    () => traceUpdates(scenario)[update - 1] ?? [],
    [scenario, update],
  );

  const graph = React.useMemo(
    () => graphOf(traceNodesOf(scenario)),
    [scenario],
  );

  const captions = React.useMemo(
    () => steps.map((f) => f.caption[lang]),
    [steps, lang],
  );

  const lastIndex = Math.max(0, steps.length - 1);

  const [index, setIndex] = React.useState(0);

  const [playing, setPlaying] = React.useState(false);

  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!playing) {
      return undefined;
    }

    if (index >= lastIndex) {
      setPlaying(false);

      return undefined;
    }

    const timer = setTimeout(() => {
      setIndex((i) => Math.min(lastIndex, i + 1));
    }, stepIntervalMs);

    return () => {
      clearTimeout(timer);
    };
  }, [playing, index, lastIndex]);

  const togglePlay = React.useCallback(() => {
    if (playing) {
      setPlaying(false);
    } else {
      if (index >= lastIndex) {
        setIndex(0);
      }

      setPlaying(true);
    }
  }, [playing, index, lastIndex]);

  const goPrev = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const expand = React.useCallback(() => {
    setExpanded(true);
  }, []);

  const collapse = React.useCallback(() => {
    setExpanded(false);
  }, []);

  const onSeek = React.useCallback(
    (e: Readonly<React.ChangeEvent<HTMLInputElement>>) => {
      setPlaying(false);

      setIndex(e.target.valueAsNumber);
    },
    [],
  );

  const step = steps[index];

  const changed = React.useMemo(
    () => changedKeys(steps[index - 1], steps[index]),
    [steps, index],
  );

  if (step === undefined) {
    return undefined;
  }

  const isFirst = index === 0;

  const isLast = index === lastIndex;

  // The same figure, in the page and, while expanded, in a modal dialog
  // covering the window; they differ only in the button that opens or
  // closes the dialog, shown above the figure.
  const content = (windowButton: React.ReactNode): React.ReactNode => (
    <>
      <div className={'propagation-trace-toolbar'}>{windowButton}</div>

      <div className={'propagation-trace-column'}>
        <TraceGraph graph={graph} lang={lang} step={step} />

        <StableCaption
          captions={captions}
          current={step.caption[lang]}
          style={captionStyle}
        />

        <div style={controlsStyle}>
          <button
            aria-label={'Previous step'}
            disabled={isFirst}
            style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
            type={'button'}
            onClick={goPrev}
          >
            {'◀ Prev'}
          </button>
          <button
            aria-label={playing ? 'Pause' : 'Play'}
            style={playButtonStyle}
            type={'button'}
            onClick={togglePlay}
          >
            {playing ? '❚❚ Pause' : isLast ? '↻ Replay' : '▶ Play'}
          </button>
          <button
            aria-label={'Next step'}
            disabled={isLast}
            style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
            type={'button'}
            onClick={goNext}
          >
            {'Next ▶'}
          </button>
          <input
            aria-label={'Step'}
            max={lastIndex}
            min={0}
            style={sliderStyle}
            type={'range'}
            value={index}
            onChange={onSeek}
          />
          <span
            style={counterStyle}
          >{`${(index + 1).toString()} / ${steps.length.toString()}`}</span>
        </div>
      </div>

      <div className={'propagation-trace-column'}>
        <div style={panelsStyle}>
          <TraceModulePanel changed={changed} step={step} />
          <TraceQueuePanel changed={changed} step={step} />
          <TraceLocalsPanel changed={changed} step={step} />
        </div>

        <TraceNodesTable changed={changed} step={step} />

        <div style={stackStyle}>
          {Arr.isEmpty(step.stack) ? (
            <span style={mutedStyle}>{'(no call running)'}</span>
          ) : (
            step.stack.map((call, i) => (
              <span
                // eslint-disable-next-line react/no-array-index-key -- a call is identified by its depth in the stack
                key={i}
                style={i === step.stack.length - 1 ? stackTopStyle : undefined}
              >
                {i === 0 ? '' : ' › '}
                {call}
              </span>
            ))
          )}
        </div>

        <TraceCode active={step.code} />
      </div>
    </>
  );

  return (
    <>
      <figure className={'propagation-trace'}>
        {content(
          <button
            aria-label={'Show full screen'}
            style={buttonEnabledStyle}
            type={'button'}
            onClick={expand}
          >
            {'Full screen'}
          </button>,
        )}
      </figure>

      {expanded ? (
        <TraceDialog onClose={collapse}>
          <figure className={'propagation-trace'}>
            {content(
              <button
                aria-label={'Close full screen'}
                style={buttonEnabledStyle}
                type={'button'}
                onClick={collapse}
              >
                {'✕ Close'}
              </button>,
            )}
          </figure>
        </TraceDialog>
      ) : undefined}
    </>
  );
});

PropagationTrace.displayName = 'PropagationTrace';

/** The keys of every field whose text differs between two steps. */
const changedKeys = (
  previous: TraceStep | undefined,
  current: TraceStep | undefined,
): ReadonlySet<string> => {
  if (previous === undefined || current === undefined) {
    return new Set<string>();
  }

  const before = flatten(previous);

  return new Set(
    Array.from(flatten(current))
      .filter(([key, value]) => before.get(key) !== value)
      .map(([key]) => key),
  );
};

const flatten = (step: TraceStep): ReadonlyMap<string, string> =>
  new Map<string, string>([
    ['propagationDepth', step.module.propagationDepth.toString()],
    ['outermostToken', step.module.outermostToken],
    ['level', step.module.level.toString()],
    ...step.module.bucketSets.flatMap((set, level) => [
      ...set.flatMap(({ nodes }, index) =>
        nodes.map(
          (v, slot) =>
            [
              `buckets.${level.toString()}.${index.toString()}.${slot.toString()}`,
              v,
            ] as const,
        ),
      ),
      ...set.map(
        (bucket, index) =>
          [
            `buckets.${level.toString()}.length.${index.toString()}`,
            bucket.length.toString(),
          ] as const,
      ),
    ]),
    ...step.queues.flatMap(
      (q) =>
        [
          [`queue.${q.token}.base`, q.base.toString()],
          [`queue.${q.token}.buckets`, q.buckets],
          [`queue.${q.token}.size`, q.size.toString()],
          [`queue.${q.token}.isOpen`, q.isOpen ? 'true' : 'false'],
          [`queue.${q.token}.queuedDespiteMark`, q.queuedDespiteMark],
        ] as const,
    ),
    ...step.locals.map((l) => [`local.${l.name}`, l.value] as const),
    ...step.nodes.flatMap((n) =>
      nodeFields.map((field) => [`${n.id}.${field}`, n[field]] as const),
    ),
  ]);

const graphOf = (nodes: readonly TraceNode[]): Graph =>
  ({
    nodes,
    nodeById: new Map(nodes.map((n) => [n.id, n])),
    viewHeight: 62 + Math.max(0, ...nodes.map((n) => n.depth)) * 112 + 72,
  }) as const;

const stepIntervalMs = 2600;

const panelsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  marginTop: 0,
} as const;

const captionStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: 1.6,
} as const;

const stackStyle: React.CSSProperties = {
  margin: 0,
  padding: '0.35rem 0.75rem',
  borderRadius: '6px',
  background: colors.background,
  color: colors.muted,
  fontFamily: monoFont,
  fontSize: '0.75rem',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
} as const;

const stackTopStyle: React.CSSProperties = {
  color: colors.text,
  fontWeight: 700,
} as const;

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.6rem',
  marginTop: 0,
} as const;

const buttonBaseStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  border: '1px solid #888',
  background: 'transparent',
  color: 'inherit',
  fontSize: '0.9rem',
  marginTop: 0, // overrides astro starlight default style
} as const;

const buttonEnabledStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  cursor: 'pointer',
} as const;

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  cursor: 'default',
  opacity: 0.4,
} as const;

const playButtonStyle: React.CSSProperties = {
  ...buttonEnabledStyle,
  minWidth: '7rem',
  fontWeight: 600,
} as const;

const sliderStyle: React.CSSProperties = {
  flex: '1 1 10rem',
  marginTop: 0,
} as const;

const counterStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  minWidth: '4rem',
  textAlign: 'center',
  marginTop: 0,
} as const;
