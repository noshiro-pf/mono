import * as React from 'react';
import { Arr, Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Lang } from '../constants.mjs';
import type {
  Chip,
  EdgeHighlight,
  Frame,
  LegendKey,
  NodeState,
  Panel,
  Trace,
} from './frame.mjs';
import {
  diamondScenario,
  filterDiamondScenario,
  rxjsDiamondScenario,
} from './scenarios.mjs';
import { simulatePriorityQueue } from './simulate-priority-queue.mjs';
import { simulateRxjs } from './simulate-rxjs.mjs';
import { simulateSynState } from './simulate-synstate.mjs';
import { StableCaption } from './stable-caption.jsx';

type Props = Readonly<{
  animation: AnimationName;
  lang: Lang;
}>;

/**
 * Steps through how one propagation algorithm updates a small graph, with a
 * caption and the pseudo-code line for each step.
 */
export const PropagationAnimation = React.memo<Props>(({ animation, lang }) => {
  const anim = React.useMemo(() => animations[animation](), [animation]);

  const { frames } = anim;

  const captions = React.useMemo(
    () => frames.map((f) => f.caption[lang]),
    [frames, lang],
  );

  const lastIndex = Math.max(0, frames.length - 1);

  const [index, setIndex] = React.useState(0);

  const [playing, setPlaying] = React.useState(false);

  const reduceMotion = React.useMemo(
    () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

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

  const goFirst = React.useCallback(() => {
    setPlaying(false);

    setIndex(0);
  }, []);

  const goPrev = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const goLast = React.useCallback(() => {
    setPlaying(false);

    setIndex(lastIndex);
  }, [lastIndex]);

  const frame = frames[index];

  if (frame === undefined) {
    return undefined;
  }

  const isFirst = index === 0;

  const isLast = index === lastIndex;

  return (
    <figure style={figureStyle}>
      <Drawing animation={anim} frame={frame} reduceMotion={reduceMotion} />
      <div style={belowStyle}>
        <StableCaption
          captions={captions}
          current={frame.caption[lang]}
          style={captionStyle}
        />
        <pre style={codeStyle}>
          {anim.code.map(([id, text]) => (
            <span
              key={id}
              style={
                frame.code.includes(id) ? codeLineActiveStyle : codeLineStyle
              }
            >
              {text === '' ? ' ' : text}
            </span>
          ))}
        </pre>
      </div>
      <div style={controlsStyle}>
        <button
          aria-label={'First step'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goFirst}
        >
          &#9198;
        </button>
        <button
          aria-label={'Previous step'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goPrev}
        >
          &#9664; {'Prev'}
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
          {'Next '}&#9654;
        </button>
        <button
          aria-label={'Last step'}
          disabled={isLast}
          style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goLast}
        >
          &#9197;
        </button>
        <span
          style={counterStyle}
        >{`${(index + 1).toString()} / ${frames.length.toString()}`}</span>
      </div>
    </figure>
  );
});

PropagationAnimation.displayName = 'PropagationAnimation';

export type AnimationName =
  'rxjs' | 'priorityQueue' | 'synstateDiamond' | 'synstateFilterDiamond';

const Drawing = React.memo<
  Readonly<{ animation: Trace; frame: Frame; reduceMotion: boolean }>
>(({ animation, frame, reduceMotion }) => {
  const { scenario } = animation;

  const maxDepth = Math.max(...scenario.nodes.map((n) => n.depth));

  const height = rowY(maxDepth) + nodeRadius + 52;

  const nodeX = new Map(scenario.nodes.map((n) => [n.id, n.x]));

  const nodeDepth = new Map(scenario.nodes.map((n) => [n.id, n.depth]));

  const center = (id: string): Point =>
    ({
      x: nodeX.get(id) ?? 0,
      y: rowY(nodeDepth.get(id) ?? 0),
    }) as const;

  const highlightOf = (from: string, to: string): EdgeHighlight | undefined =>
    frame.edges.find((e) => e.from === from && e.to === to);

  const sourceId = scenario.nodes[0]?.id ?? '';

  return (
    <svg
      aria-label={animation.label}
      role={'img'}
      style={svgStyle}
      viewBox={`0 0 ${viewWidth.toString()} ${height.toString()}`}
    >
      <defs>
        {Object.entries(edgeColors).map(([kind, color]) => (
          <marker
            id={`queue-arrow-${kind}`}
            key={kind}
            markerHeight={7}
            markerWidth={7}
            orient={'auto'}
            refX={10}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path d={'M 0 0 L 10 5 L 0 10 z'} fill={color} />
          </marker>
        ))}
      </defs>

      <rect
        fill={colors.background}
        height={height}
        rx={10}
        width={viewWidth}
      />

      <PanelView
        maxDepth={maxDepth}
        panel={frame.panel}
        reduceMotion={reduceMotion}
        sourceId={sourceId}
        update={animation.showTokens ? frame.update : 0}
      />

      {/* Edges */}
      {scenario.nodes.flatMap((child) =>
        child.parents.map((parent) => {
          const h = highlightOf(parent, child.id);

          const kind = h?.kind ?? 'none';

          const from = center(parent);

          const to = center(child.id);

          const len = Math.hypot(to.x - from.x, to.y - from.y);

          const ux = Num.isNonZero(len) ? Num.div(to.x - from.x, len) : 0;

          const uy = Num.isNonZero(len) ? Num.div(to.y - from.y, len) : 0;

          return (
            <line
              key={`${parent}-${child.id}`}
              markerEnd={`url(#queue-arrow-${kind})`}
              stroke={edgeColors[kind]}
              strokeDasharray={
                kind === 'stale' || kind === 'already' ? '6 5' : undefined
              }
              strokeWidth={kind === 'none' ? 2 : 3.5}
              style={reduceMotion ? undefined : strokeTransition}
              x1={from.x + ux * nodeRadius}
              x2={to.x - ux * (nodeRadius + 4)}
              y1={from.y + uy * nodeRadius}
              y2={to.y - uy * (nodeRadius + 4)}
            />
          );
        }),
      )}

      {/* Operator labels */}
      {scenario.nodes.map((n) =>
        n.op === undefined ? undefined : (
          <g key={`op-${n.id}`}>
            <rect
              fill={colors.opBackground}
              height={24}
              rx={4}
              width={n.op.text.length * 7.8 + 16}
              x={n.op.x - (n.op.text.length * 7.8 + 16) / 2}
              y={n.op.y - 12}
            />
            <text
              dominantBaseline={'central'}
              fill={colors.opText}
              fontFamily={monoFont}
              fontSize={13}
              textAnchor={'middle'}
              x={n.op.x}
              y={n.op.y}
            >
              {n.op.text}
            </text>
          </g>
        ),
      )}

      {/* Nodes */}
      {scenario.nodes.map((n) => {
        const state = frame.nodes[n.id];

        return state === undefined ? undefined : (
          <NodeView
            active={frame.activeNode === n.id}
            center={center(n.id)}
            currentUpdate={frame.update}
            id={n.id}
            key={n.id}
            reduceMotion={reduceMotion}
            showToken={animation.showTokens}
            state={state}
            valuesSide={n.valuesSide}
          />
        );
      })}

      {/* Queued nodes */}
      {chipsOf(frame.panel).map((chip) => (
        <ChipView
          chip={chip}
          from={center(chip.from)}
          key={chip.key}
          reduceMotion={reduceMotion}
          to={
            chip.leaving
              ? center(chip.node)
              : frame.panel.type === 'priorityQueue'
                ? { x: chipX(chip.slot), y: rowY(1) - 6 }
                : { x: chipX(chip.slot), y: rowY(chip.lane) }
          }
        />
      ))}

      <Legend items={animation.legend} y={height - 18} />
    </svg>
  );
});

Drawing.displayName = 'Drawing';

/** Where the algorithm keeps its pending work: buckets, a queue, or calls. */
const PanelView = React.memo<
  Readonly<{
    panel: Panel;
    maxDepth: number;
    sourceId: string;
    update: number;
    reduceMotion: boolean;
  }>
>(({ panel, maxDepth, sourceId, update, reduceMotion }) => {
  switch (panel.type) {
    case 'buckets':
      return (
        <g>
          {Array.from({ length: maxDepth + 1 }, (_, depth) => (
            <g key={depth}>
              <Lane
                active={panel.activeDepth === depth}
                height={laneHeight}
                label={
                  depth === 0
                    ? `queue${update > 0 ? ` t${update.toString()}` : ''}`
                    : `bucket[${depth.toString()}]`
                }
                reduceMotion={reduceMotion}
                y={rowY(depth)}
              />
              {depth === 0 ? (
                <text
                  dominantBaseline={'central'}
                  fill={colors.text}
                  fontFamily={monoFont}
                  fontSize={13}
                  x={chipX(0) - chipWidth / 2}
                  y={rowY(0)}
                >
                  {`manager ${sourceId}`}
                </text>
              ) : undefined}
            </g>
          ))}
        </g>
      );

    case 'priorityQueue':
      return (
        <Lane
          active={false}
          height={laneHeight + 14}
          label={'queue'}
          reduceMotion={reduceMotion}
          y={rowY(1)}
        />
      );

    case 'callStack': {
      const top = rowY(0) - laneHeight / 2;

      return (
        <g fontFamily={monoFont} fontSize={14}>
          <rect
            fill={colors.laneBackground}
            height={rowY(maxDepth) + laneHeight / 2 - top}
            rx={8}
            stroke={colors.laneBorder}
            width={laneWidth}
            x={laneX}
            y={top}
          />
          <text
            fill={colors.mutedText}
            fontSize={13}
            x={laneX + 12}
            y={top + 22}
          >
            {'call stack'}
          </text>
          {panel.calls.map((call, i) => (
            <text
              fill={
                i === panel.calls.length - 1 ? colors.visiting : colors.text
              }
              fontWeight={i === panel.calls.length - 1 ? 700 : 400}

              key={i}
              x={laneX + 12 + i * 12}
              y={top + 52 + i * 28}
            >
              {`${i === 0 ? '' : '└ '}${call}`}
            </text>
          ))}
        </g>
      );
    }
  }
});

PanelView.displayName = 'PanelView';

const Lane = React.memo<
  Readonly<{
    y: number;
    height: number;
    label: string;
    active: boolean;
    reduceMotion: boolean;
  }>
>(({ y, height, label, active, reduceMotion }) => (
  <g>
    <rect
      fill={active ? colors.laneActive : colors.laneBackground}
      height={height}
      rx={8}
      stroke={active ? colors.visiting : colors.laneBorder}
      strokeWidth={active ? 2 : 1}
      style={reduceMotion ? undefined : fadeTransition}
      width={laneWidth}
      x={laneX}
      y={y - height / 2}
    />
    <text
      dominantBaseline={'central'}
      fill={colors.mutedText}
      fontFamily={monoFont}
      fontSize={13}
      x={laneX + 12}
      y={y}
    >
      {label}
    </text>
  </g>
));

Lane.displayName = 'Lane';

const NodeView = React.memo<
  Readonly<{
    id: string;
    center: Point;
    state: NodeState;
    active: boolean;
    currentUpdate: number;
    valuesSide: 'left' | 'right';
    showToken: boolean;
    reduceMotion: boolean;
  }>
>(
  ({
    id,
    center,
    state,
    active,
    currentUpdate,
    valuesSide,
    showToken,
    reduceMotion,
  }) => {
    const shown = Arr.takeLast(state.history, 7);

    const sign = valuesSide === 'right' ? 1 : -1;

    const valuesX = center.x + sign * (nodeRadius + 12);

    const tokenX = center.x - sign * (nodeRadius + 24);

    const isCurrentToken = state.token === currentUpdate && currentUpdate > 0;

    return (
      <g>
        <circle
          cx={center.x}
          cy={center.y}
          fill={nodeFill[state.status]}
          r={nodeRadius}
          stroke={active ? colors.visiting : 'none'}
          strokeWidth={active ? 5 : 0}
          style={reduceMotion ? undefined : fillTransition}
        />
        <text
          dominantBaseline={'central'}
          fill={colors.nodeText}
          fontFamily={monoFont}
          fontSize={20}
          fontWeight={700}
          textAnchor={'middle'}
          x={center.x}
          y={center.y + 1}
        >
          {id}
        </text>
        {showToken ? (
          <g>
            <rect
              fill={isCurrentToken ? colors.token : colors.tokenStale}
              height={22}
              rx={11}
              width={36}
              x={tokenX - 18}
              y={center.y - 11}
            />
            <text
              dominantBaseline={'central'}
              fill={colors.background}
              fontFamily={monoFont}
              fontSize={13}
              fontWeight={700}
              textAnchor={'middle'}
              x={tokenX}
              y={center.y + 1}
            >
              {`t${state.token.toString()}`}
            </text>
          </g>
        ) : undefined}
        <text
          dominantBaseline={'central'}
          fill={colors.values}
          fontFamily={monoFont}
          fontSize={15}
          textAnchor={valuesSide === 'right' ? 'start' : 'end'}
          x={valuesX}
          y={center.y}
        >
          {shown.map((entry, i) => {
            const isLatest = i === shown.length - 1;

            const fresh = isLatest && state.status === 'emitted';

            return (
              <React.Fragment key={i}>
                <tspan
                  fill={
                    entry.glitch
                      ? colors.glitch
                      : fresh
                        ? colors.fresh
                        : colors.values
                  }
                  fontWeight={fresh || entry.glitch ? 700 : 400}
                >
                  {entry.value.toString()}
                </tspan>
                {isLatest ? undefined : <tspan>{', '}</tspan>}
              </React.Fragment>
            );
          })}
        </text>
      </g>
    );
  },
);

NodeView.displayName = 'NodeView';

const ChipView = React.memo<
  Readonly<{ chip: Chip; from: Point; to: Point; reduceMotion: boolean }>
>(({ chip, from, to, reduceMotion }) => {
  const ref = React.useRef<SVGGElement>(null);

  // Where the chip first appeared: it flies in from the parent that queued
  // it, once, when it is mounted.
  const mounted = React.useRef({ from, to, chip, reduceMotion });

  React.useLayoutEffect(() => {
    const m = mounted.current;

    if (m.reduceMotion || m.chip.leaving || ref.current === null) {
      return;
    }

    ref.current.animate(
      [
        { transform: translate(m.from), opacity: 0.2 },
        { transform: translate(m.to), opacity: 1 },
      ],
      { duration: chipFlightMs, easing: 'ease-out' },
    );
  }, []);

  return (
    <g
      ref={ref}
      style={{
        transform: translate(to),
        opacity: chip.leaving ? 0 : 1,
        transition: reduceMotion
          ? 'none'
          : `transform ${chipFlightMs.toString()}ms ease, opacity ${chipFlightMs.toString()}ms ease`,
      }}
    >
      <rect
        fill={colors.chip}
        height={chipHeight}
        rx={6}
        stroke={colors.chipBorder}
        strokeWidth={2}
        width={chipWidth}
        x={-chipWidth / 2}
        y={-chipHeight / 2}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.nodeText}
        fontFamily={monoFont}
        fontSize={17}
        fontWeight={700}
        textAnchor={'middle'}
        y={1}
      >
        {chip.node}
      </text>
      {chip.note === undefined ? undefined : (
        <text
          dominantBaseline={'central'}
          fill={colors.mutedText}
          fontFamily={monoFont}
          fontSize={11}
          textAnchor={'middle'}
          y={chipHeight / 2 + 11}
        >
          {chip.note}
        </text>
      )}
    </g>
  );
});

ChipView.displayName = 'ChipView';

const Legend = React.memo<Readonly<{ items: readonly LegendKey[]; y: number }>>(
  ({ items, y }) => (
    <g fontFamily={monoFont} fontSize={12}>
      {items.map((key, i) => {
        const item = legendItems[key];

        return (
          <g
            key={key}
            transform={`translate(${legendX(items, i).toString()} ${y.toString()})`}
          >
            <circle
              cx={0}
              cy={0}
              fill={item.fill}
              r={7}
              stroke={item.stroke}
              strokeWidth={item.stroke === 'none' ? 0 : 3}
            />
            <text
              dominantBaseline={'central'}
              fill={colors.mutedText}
              x={14}
              y={1}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  ),
);

Legend.displayName = 'Legend';

type Point = Readonly<{ x: number; y: number }>;

const animations: ReadonlyRecord<AnimationName, () => Trace> = {
  rxjs: () => simulateRxjs(rxjsDiamondScenario),
  priorityQueue: () => simulatePriorityQueue(diamondScenario),
  synstateDiamond: () => simulateSynState(diamondScenario, { tokens: false }),
  synstateFilterDiamond: () =>
    simulateSynState(filterDiamondScenario, { tokens: true }),
} as const;

const chipsOf = (panel: Panel): readonly Chip[] =>
  panel.type === 'callStack' ? ([] as const) : panel.chips;

const stepIntervalMs = 2200;

const chipFlightMs = 600;

const viewWidth = 840;

const nodeRadius = 26;

const laneX = 12;

const laneWidth = 230;

const laneHeight = 60;

const chipWidth = 40;

const chipHeight = 34;

const chipX = (slot: number): number => laneX + 112 + slot * 50;

const rowY = (depth: number): number => 52 + depth * 136;

const translate = (p: Point): string =>
  `translate(${p.x.toString()}px, ${p.y.toString()}px)` as const;

const monoFont = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const colors = {
  background: '#37474f',
  laneBackground: 'rgba(255, 255, 255, 0.04)',
  laneActive: 'rgba(255, 64, 129, 0.12)',
  laneBorder: 'rgba(255, 255, 255, 0.18)',
  text: '#eceff1',
  mutedText: '#b0bec5',
  nodeText: '#263238',
  values: '#fff59d',
  fresh: '#69f0ae',
  token: '#4dd0e1',
  tokenStale: '#78909c',
  visiting: '#ff4081',
  opBackground: '#546e7a',
  opText: '#c5e1a5',
  chip: '#fff59d',
  chipBorder: '#fbc02d',
  glitch: '#ff5252',
} as const;

const nodeFill = {
  idle: '#e0e0e0',
  visiting: '#e0e0e0',
  emitted: '#ffb74d',
  skipped: '#78909c',
} as const;

const edgeColors = {
  none: '#90a4ae',
  queue: '#fff59d',
  already: '#fff59d',
  emitted: '#69f0ae',
  stale: '#78909c',
  call: '#ff4081',
} as const;

const legendItems = {
  emitted: {
    label: 'emitted in this update',
    fill: nodeFill.emitted,
    stroke: 'none',
  },
  visiting: {
    label: 'being visited',
    fill: nodeFill.visiting,
    stroke: colors.visiting,
  },
  skipped: { label: 'did not emit', fill: nodeFill.skipped, stroke: 'none' },
  queued: { label: 'queued', fill: colors.chip, stroke: colors.chipBorder },
  glitch: { label: 'glitch', fill: colors.glitch, stroke: 'none' },
} as const satisfies ReadonlyRecord<
  LegendKey,
  Readonly<{ label: string; fill: string; stroke: string }>
>;

/** Each legend item is as wide as its label. */
const legendX = (items: readonly LegendKey[], index: number): number =>
  laneX +
  8 +
  items
    .slice(0, index)
    .reduce((acc, key) => acc + legendItems[key].label.length * 7.3 + 44, 0);

const fadeTransition: React.CSSProperties = {
  transition: 'fill 300ms ease, stroke 300ms ease',
} as const;

const strokeTransition: React.CSSProperties = {
  transition: 'stroke 300ms ease',
} as const;

const fillTransition: React.CSSProperties = {
  transition: 'fill 400ms ease, stroke-width 200ms ease',
} as const;

const figureStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.75rem',
  margin: '1.5rem 0',
} as const;

const svgStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
} as const;

const belowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  alignItems: 'flex-start',
  marginTop: 0,
} as const;

const captionStyle: React.CSSProperties = {
  flex: '1 1 16rem',
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: 1.6,
} as const;

const codeStyle: React.CSSProperties = {
  flex: '1 1 20rem',
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: '0.5rem 0',
  fontSize: '0.78rem',
  lineHeight: 1.45,
  background: colors.background,
  color: colors.mutedText,
  borderRadius: '6px',
  overflowX: 'auto',
} as const;

const codeLineStyle: React.CSSProperties = {
  padding: '0 0.75rem',
  whiteSpace: 'pre',
} as const;

const codeLineActiveStyle: React.CSSProperties = {
  ...codeLineStyle,
  background: 'rgba(255, 64, 129, 0.25)',
  color: colors.text,
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

const counterStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  minWidth: '4rem',
  textAlign: 'center',
} as const;
