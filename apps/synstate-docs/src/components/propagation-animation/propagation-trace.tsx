import * as React from 'react';
import { Arr, Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Lang } from './scenario.mjs';
import {
  traceCode,
  traceNodesOf,
  traceUpdates,
  type TraceScenarioName,
} from './simulate-trace.mjs';
import { StableCaption } from './stable-caption.jsx';
import { TraceDialog } from './trace-dialog.jsx';
import {
  undefinedText,
  type BucketSet,
  type NodeRow,
  type TraceNode,
  type TraceStep,
} from './trace-step.mjs';

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
export const PropagationTrace = React.memo<Props>(
  ({ scenario, update, lang }) => {
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
          <GraphView graph={graph} lang={lang} step={step} />

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
            <ModulePanel changed={changed} step={step} />
            <QueuePanel changed={changed} step={step} />
            <LocalsPanel changed={changed} step={step} />
          </div>

          <NodesTable changed={changed} step={step} />

          <div style={stackStyle}>
            {Arr.isEmpty(step.stack) ? (
              <span style={mutedStyle}>{'(no call running)'}</span>
            ) : (
              step.stack.map((call, i) => (
                <span
                  key={i}
                  style={
                    i === step.stack.length - 1 ? stackTopStyle : undefined
                  }
                >
                  {i === 0 ? '' : ' › '}
                  {call}
                </span>
              ))
            )}
          </div>

          <CodeView active={step.code} />
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
                  &#x2715; {'Close'}
                </button>,
              )}
            </figure>
          </TraceDialog>
        ) : undefined}
      </>
    );
  },
);

PropagationTrace.displayName = 'PropagationTrace';

/** The graph, with the queue's pointers drawn on the nodes they point at. */
const GraphView = React.memo<
  Readonly<{ graph: Graph; step: TraceStep; lang: Lang }>
>(({ graph, step, lang }) => {
  const { nodes, nodeById, viewHeight } = graph;

  const rows = new Map(step.nodes.map((n) => [n.id, n]));

  const pointers = pointersOf(step, nodeById);

  const openTokens: ReadonlySet<string> = new Set(
    step.queues.filter((q) => q.isOpen).map((q) => q.token),
  );

  return (
    <svg
      aria-label={'The graph, with each node’s queue fields'}
      role={'img'}
      viewBox={`0 0 ${viewWidth.toString()} ${viewHeight.toString()}`}
    >
      <defs>
        <marker
          id={'trace-arrow-edge'}
          markerHeight={7}
          markerWidth={7}
          orient={'auto'}
          refX={10}
          refY={5}
          viewBox={'0 0 10 10'}
        >
          <path d={'M 0 0 L 10 5 L 0 10 z'} fill={colors.edge} />
        </marker>
      </defs>

      <rect
        fill={colors.background}
        height={viewHeight}
        rx={10}
        width={viewWidth}
      />

      {nodes.flatMap((child) =>
        child.parents.map((parentId) => {
          const parent = nodeById.get(parentId);

          if (parent === undefined) {
            return undefined;
          }

          const from = centerOf(parent);

          const to = centerOf(child);

          const len = Math.hypot(to.x - from.x, to.y - from.y);

          const ux = Num.isNonZero(len) ? Num.div(to.x - from.x, len) : 0;

          const uy = Num.isNonZero(len) ? Num.div(to.y - from.y, len) : 0;

          return (
            <line
              key={`${parentId}-${child.id}`}
              markerEnd={'url(#trace-arrow-edge)'}
              stroke={colors.edge}
              strokeWidth={2}
              x1={from.x + ux * nodeRadius}
              x2={to.x - ux * (nodeRadius + 4)}
              y1={from.y + uy * nodeRadius}
              y2={to.y - uy * (nodeRadius + 4)}
            />
          );
        }),
      )}

      {nodes.map((n) => {
        const row = rows.get(n.id);

        return row === undefined ? undefined : (
          <NodeView
            active={step.activeNode === n.id}
            freshTokens={step.freshTokens}
            key={n.id}
            markedByOpenUpdate={openTokens.has(row.queuedFor)}
            node={n}
            pointers={pointers.get(n.id) ?? []}
            row={row}
          />
        );
      })}

      <g fontFamily={monoFont} fontSize={12}>
        {legend.map((item, i) => (
          <g
            key={item.label.en}
            transform={`translate(${(16 + legendOffset(legend, i, lang)).toString()} ${(viewHeight - 16).toString()})`}
          >
            <rect
              fill={item.fill}
              height={12}
              rx={3}
              stroke={item.stroke}
              strokeWidth={2}
              width={12}
              x={0}
              y={-6}
            />
            <text dominantBaseline={'central'} fill={colors.muted} x={18}>
              {item.label[lang]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});

GraphView.displayName = 'GraphView';

const NodeView = React.memo<
  Readonly<{
    node: TraceNode;
    row: NodeRow;
    active: boolean;
    freshTokens: readonly string[];
    markedByOpenUpdate: boolean;
    pointers: readonly Pointer[];
  }>
>(({ node, row, active, freshTokens, markedByOpenUpdate, pointers }) => {
  const c = centerOf(node);

  const fill = row.emitted
    ? colors.emitted
    : row.skipped
      ? colors.skipped
      : colors.idle;

  const current = freshTokens.includes(row.updateToken);

  const tagsTop = c.y - (pointers.length * 19) / 2;

  return (
    <g>
      {markedByOpenUpdate ? (
        <circle
          cx={c.x}
          cy={c.y}
          fill={'none'}
          r={nodeRadius + 6}
          stroke={colors.queued}
          strokeDasharray={'4 3'}
          strokeWidth={3}
        />
      ) : undefined}
      <circle
        cx={c.x}
        cy={c.y}
        fill={fill}
        r={nodeRadius}
        stroke={active ? colors.active : 'none'}
        strokeWidth={active ? 5 : 0}
      />
      <text
        dominantBaseline={'central'}
        fill={colors.nodeText}
        fontFamily={monoFont}
        fontSize={node.id.length > 1 ? 15 : 18}
        fontWeight={700}
        textAnchor={'middle'}
        x={c.x}
        y={c.y + 1}
      >
        {node.id}
      </text>

      {/* value and token, to the right */}
      <text
        dominantBaseline={'central'}
        fill={row.emitted ? colors.fresh : colors.values}
        fontFamily={monoFont}
        fontSize={14}
        fontWeight={row.emitted ? 700 : 400}
        x={c.x + nodeRadius + 10}
        y={c.y - 9}
      >
        {row.snapshot}
      </text>
      <g>
        <rect
          fill={current ? colors.token : colors.tokenStale}
          height={18}
          rx={9}
          width={30}
          x={c.x + nodeRadius + 8}
          y={c.y + 2}
        />
        <text
          dominantBaseline={'central'}
          fill={colors.background}
          fontFamily={monoFont}
          fontSize={12}
          fontWeight={700}
          textAnchor={'middle'}
          x={c.x + nodeRadius + 23}
          y={c.y + 11}
        >
          {row.updateToken}
        </text>
      </g>

      {/* operator, below */}
      <text
        fill={colors.op}
        fontFamily={monoFont}
        fontSize={11}
        textAnchor={'middle'}
        x={c.x}
        y={c.y + nodeRadius + 15}
      >
        {node.op}
      </text>

      {/* pointers, to the left */}
      {pointers.map((p, i) => (
        <g key={p.label}>
          <rect
            fill={pointerColors[p.kind]}
            height={17}
            rx={4}
            width={p.label.length * 7 + 10}
            x={c.x - nodeRadius - 10 - (p.label.length * 7 + 10)}
            y={tagsTop + i * 19}
          />
          <text
            dominantBaseline={'central'}
            fill={colors.background}
            fontFamily={monoFont}
            fontSize={11.5}
            fontWeight={700}
            textAnchor={'middle'}
            x={c.x - nodeRadius - 10 - (p.label.length * 7 + 10) / 2}
            y={tagsTop + i * 19 + 9}
          >
            {p.label}
          </text>
        </g>
      ))}
    </g>
  );
});

NodeView.displayName = 'NodeView';

const ModulePanel = React.memo<
  Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>
>(({ step, changed }) => {
  const m = step.module;

  return (
    <section style={panelStyle}>
      <h4 style={panelTitleStyle}>{'propagation-state.mts'}</h4>
      <Field
        changed={changed.has('propagationDepth')}
        name={'propagation.depth'}
        value={m.propagationDepth.toString()}
      />
      <Field
        changed={changed.has('outermostToken')}
        name={'propagation.outermostToken'}
        value={m.outermostToken}
      />
      <Field
        changed={changed.has('level')}
        name={'queueState.level'}
        value={m.level.toString()}
      />
      {Arr.isEmpty(m.bucketSets) ? (
        <Field changed={false} name={'bucketSets'} value={'[]'} />
      ) : (
        m.bucketSets.map((set, level) => (
          <BucketSetView
            changed={changed}
            key={level}
            level={level}
            set={set}
          />
        ))
      )}
    </section>
  );
});

ModulePanel.displayName = 'ModulePanel';

const QueuePanel = React.memo<
  Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>
>(({ step, changed }) =>
  Arr.isEmpty(step.queues) ? (
    <section style={panelStyle}>
      <h4 style={panelTitleStyle}>{'UpdateQueue'}</h4>
      <span style={mutedStyle}>{'no update is open'}</span>
    </section>
  ) : (
    <>
      {step.queues.map((q) => {
        const key = (field: string): string =>
          `queue.${q.token}.${field}` as const;

        return (
          <section key={q.token} style={panelStyle}>
            <h4
              style={panelTitleStyle}
            >{`UpdateQueue ${q.token} (= token)`}</h4>
            <Field
              changed={changed.has(key('base'))}
              name={'#base'}
              value={q.base.toString()}
            />
            <Field
              changed={changed.has(key('buckets'))}
              name={'#buckets'}
              value={q.buckets}
            />
            <Field
              changed={changed.has(key('size'))}
              name={'#size'}
              value={q.size.toString()}
            />
            <Field
              changed={changed.has(key('isOpen'))}
              name={'#isOpen'}
              value={q.isOpen ? 'true' : 'false'}
            />
            <Field
              changed={changed.has(key('queuedDespiteMark'))}
              name={'#queuedDespiteMark'}
              value={q.queuedDespiteMark}
            />
          </section>
        );
      })}
    </>
  ),
);

QueuePanel.displayName = 'QueuePanel';

const LocalsPanel = React.memo<
  Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>
>(({ step, changed }) => (
  <section style={panelStyle}>
    <h4 style={panelTitleStyle}>{'locals'}</h4>
    {Arr.isEmpty(step.locals) ? (
      <span style={mutedStyle}>{'—'}</span>
    ) : (
      step.locals.map((l) => (
        <Field
          changed={changed.has(`local.${l.name}`)}
          key={l.name}
          name={l.name}
          value={l.value}
        />
      ))
    )}
  </section>
));

LocalsPanel.displayName = 'LocalsPanel';

const NodesTable = React.memo<
  Readonly<{ step: TraceStep; changed: ReadonlySet<string> }>
>(({ step, changed }) => (
  <div style={tableWrapStyle}>
    <table style={tableStyle}>
      <thead>
        <tr>
          {nodeColumns.map((col) => (
            <th key={col} style={thStyle}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {step.nodes.map((n) => (
          <tr
            key={n.id}
            style={step.activeNode === n.id ? activeRowStyle : undefined}
          >
            <td style={tdStyle}>{n.id}</td>
            <td style={tdStyle}>{n.depth.toString()}</td>
            {nodeFields.map((field) => (
              <td
                key={field}
                style={
                  changed.has(`${n.id}.${field}`) ? tdChangedStyle : tdStyle
                }
              >
                {n[field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

NodesTable.displayName = 'NodesTable';

const Field = React.memo<
  Readonly<{ name: string; value: string; changed: boolean }>
>(({ name, value, changed }) => (
  <div style={fieldStyle}>
    <span style={fieldNameStyle}>{name}</span>
    <span style={changed ? valueChangedStyle : valueStyle}>{value}</span>
  </div>
));

Field.displayName = 'Field';

/**
 * One bucket set: a row per depth index, its slots, and its length. A slot
 * at or past the length is not in use, and is drawn faded.
 */
const BucketSetView = React.memo<
  Readonly<{ set: BucketSet; level: number; changed: ReadonlySet<string> }>
>(({ set, level, changed }) => {
  const prefix = `buckets.${level.toString()}` as const;

  return (
    <div style={bucketSetStyle}>
      <span style={fieldNameStyle}>{`bucketSets[${level.toString()}]`}</span>
      {Arr.isEmpty(set) ? (
        <span style={valueStyle}>{'[]'}</span>
      ) : (
        set.map(({ nodes, length }, index) => {
          const i = index.toString();

          return (
            <div key={index} style={bucketRowStyle}>
              <span style={fieldNameStyle}>{`[${i}].nodes`}</span>
              <span style={cellsStyle}>
                {Arr.isEmpty(nodes) ? (
                  <span style={valueStyle}>{'[]'}</span>
                ) : (
                  nodes.map((v, slot) => (
                    <span
                      key={slot}
                      style={
                        changed.has(`${prefix}.${i}.${slot.toString()}`)
                          ? cellChangedStyle
                          : slot < length
                            ? cellStyle
                            : cellUnusedStyle
                      }
                      title={`bucketSets[${level.toString()}][${i}].nodes[${slot.toString()}]`}
                    >
                      <span style={cellIndexStyle}>{slot.toString()}</span>
                      {v === undefinedText ? '—' : v}
                    </span>
                  ))
                )}
              </span>
              <span
                style={
                  changed.has(`${prefix}.length.${i}`)
                    ? valueChangedStyle
                    : valueStyle
                }
                title={`bucketSets[${level.toString()}][${i}].length`}
              >
                {`length ${length.toString()}`}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
});

BucketSetView.displayName = 'BucketSetView';

/** The source, with the lines this step runs highlighted and in view. */
const CodeView = React.memo<Readonly<{ active: readonly string[] }>>(
  ({ active }) => {
    const ref = React.useRef<HTMLPreElement>(null);

    React.useLayoutEffect(() => {
      const pre = ref.current;

      const ids = traceCode
        .map(([id]) => id)
        .filter((id) => active.includes(id));

      const first = ids.at(0);

      const last = ids.at(-1);

      if (pre === null || first === undefined || last === undefined) {
        return;
      }

      const firstLine = pre.querySelector<HTMLElement>(
        `[data-line="${CSS.escape(first)}"]`,
      );

      const lastLine = pre.querySelector<HTMLElement>(
        `[data-line="${CSS.escape(last)}"]`,
      );

      if (firstLine === null || lastLine === null) {
        return;
      }

      const top = firstLine.offsetTop;

      const bottom = lastLine.offsetTop + lastLine.offsetHeight;

      // Centers the lines run, or, when they do not fit, keeps the last
      // ones in view: those are the lines the step is about. Scrolls the
      // pane only, never the page.
      pre.scrollTop = Math.max(
        0,
        bottom - top <= pre.clientHeight
          ? top - (pre.clientHeight - (bottom - top)) / 2
          : bottom - pre.clientHeight,
      );
    }, [active]);

    return (
      <pre className={'propagation-trace-code'} ref={ref} style={codeStyle}>
        {traceCode.map(([id, text]) => (
          <span
            data-line={id}
            key={id}
            style={active.includes(id) ? codeLineActiveStyle : codeLineStyle}
          >
            {text === '' ? ' ' : text}
          </span>
        ))}
      </pre>
    );
  },
);

CodeView.displayName = 'CodeView';

type Point = Readonly<{ x: number; y: number }>;

type Pointer = Readonly<{ label: string; kind: PointerKind }>;

type PointerKind = 'bucket' | 'local';

/**
 * What points at each node: the slots in use of each bucket set, as
 * `[index][slot]` (prefixed by the token of a nested update's set), and the
 * locals.
 */
const pointersOf = (
  step: TraceStep,
  nodeById: ReadonlyMap<string, TraceNode>,
): ReadonlyMap<string, readonly Pointer[]> => {
  const mut_byNode = new Map<string, Pointer[]>();

  const add = (id: string, pointer: Pointer): void => {
    if (id === undefinedText || !nodeById.has(id)) {
      return;
    }

    const mut_list = mut_byNode.get(id);

    if (mut_list === undefined) {
      mut_byNode.set(id, [pointer]);
    } else {
      mut_list.push(pointer);
    }
  };

  const nested = step.module.bucketSets.length > 1;

  for (const [level, set] of step.module.bucketSets.entries()) {
    const owner = step.queues[level]?.token;

    for (const [index, { nodes, length }] of set.entries()) {
      for (const [slot, id] of nodes.entries()) {
        if (slot < length) {
          add(id, {
            label: `${nested && owner !== undefined ? `${owner} ` : ''}[${index.toString()}][${slot.toString()}]`,
            kind: 'bucket',
          });
        }
      }
    }
  }

  for (const l of step.locals) {
    if (pointerLocals.has(l.name)) {
      add(l.value, { label: l.name, kind: 'local' });
    }
  }

  return mut_byNode;
};

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
        ({ length }, index) =>
          [
            `buckets.${level.toString()}.length.${index.toString()}`,
            length.toString(),
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

const nodeFields = [
  'snapshot',
  'updateToken',
  'queuedFor',
] as const satisfies readonly (keyof NodeRow)[];

const nodeColumns = ['node', 'depth', ...nodeFields] as const;

/** The locals drawn as a tag on the node they hold. */
const pointerLocals: ReadonlySet<string> = new Set<string>(['child', 'node']);

type Graph = Readonly<{
  nodes: readonly TraceNode[];
  nodeById: ReadonlyMap<string, TraceNode>;
  viewHeight: number;
}>;

const graphOf = (nodes: readonly TraceNode[]): Graph =>
  ({
    nodes,
    nodeById: new Map(nodes.map((n) => [n.id, n])),
    viewHeight: 62 + Math.max(0, ...nodes.map((n) => n.depth)) * 112 + 72,
  }) as const;

const centerOf = (n: TraceNode): Point =>
  ({ x: n.x, y: 62 + n.depth * 112 }) as const;

const stepIntervalMs = 2600;

const viewWidth = 680;

const nodeRadius = 24;

const monoFont = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const colors = {
  background: '#37474f',
  edge: '#90a4ae',
  text: '#eceff1',
  muted: '#b0bec5',
  nodeText: '#263238',
  values: '#fff59d',
  fresh: '#69f0ae',
  token: '#4dd0e1',
  tokenStale: '#78909c',
  active: '#ff4081',
  queued: '#fff59d',
  op: '#c5e1a5',
  idle: '#e0e0e0',
  emitted: '#ffb74d',
  skipped: '#78909c',
  changed: 'rgba(255, 64, 129, 0.35)',
} as const;

const pointerColors = {
  bucket: '#4dd0e1',
  local: '#f48fb1',
} as const satisfies ReadonlyRecord<PointerKind, string>;

const legend = [
  {
    label: { en: 'emitted', ja: '発行した' },
    fill: colors.emitted,
    stroke: 'none',
  },
  {
    label: { en: 'did not emit', ja: '発行しなかった' },
    fill: colors.skipped,
    stroke: 'none',
  },
  {
    label: { en: 'open update’s mark', ja: '開いた更新の印' },
    fill: 'none',
    stroke: colors.queued,
  },
  {
    label: { en: '[index][slot]', ja: '[index][slot]' },
    fill: pointerColors.bucket,
    stroke: 'none',
  },
] as const;

/** Where legend item `i` starts: after the items before it, as wide as their labels. */
const legendOffset = (
  items: readonly Readonly<{ label: ReadonlyRecord<Lang, string> }>[],
  i: number,
  lang: Lang,
): number =>
  items
    .slice(0, i)
    .reduce(
      (sum, item) =>
        sum + 18 + item.label[lang].length * (lang === 'ja' ? 12 : 7.3) + 22,
      0,
    );

const panelsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  marginTop: 0,
} as const;

const panelStyle: React.CSSProperties = {
  flex: '1 1 12rem',
  margin: 0,
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  background: colors.background,
  color: colors.text,
  fontFamily: monoFont,
  fontSize: '0.78rem',
  lineHeight: 1.6,
} as const;

const panelTitleStyle: React.CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: colors.muted,
} as const;

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: 0,
} as const;

const fieldNameStyle: React.CSSProperties = {
  color: colors.muted,
} as const;

const valueStyle: React.CSSProperties = {
  padding: '0 0.3rem',
  borderRadius: '3px',
  transition: 'background 300ms ease',
} as const;

const valueChangedStyle: React.CSSProperties = {
  ...valueStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

const cellsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.2rem',
  marginTop: 0,
} as const;

const cellStyle: React.CSSProperties = {
  position: 'relative',
  minWidth: '2.2rem',
  padding: '0.45rem 0.2rem 0',
  border: `1px solid ${colors.edge}`,
  borderRadius: '3px',
  textAlign: 'center',
  marginTop: 0,
  transition: 'background 300ms ease',
} as const;

const cellChangedStyle: React.CSSProperties = {
  ...cellStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

const cellUnusedStyle: React.CSSProperties = {
  ...cellStyle,
  borderStyle: 'dashed',
  opacity: 0.45,
} as const;

const bucketSetStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  marginTop: '0.2rem',
} as const;

const bucketRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: 0,
  paddingLeft: '0.75rem',
} as const;

const cellIndexStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-0.1rem',
  left: '0.2rem',
  fontSize: '0.6rem',
  color: colors.muted,
} as const;

const mutedStyle: React.CSSProperties = {
  color: colors.muted,
} as const;

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  marginTop: 0,
} as const;

const tableStyle: React.CSSProperties = {
  width: '100%',
  margin: 0,
  borderCollapse: 'collapse',
  fontFamily: monoFont,
  fontSize: '0.78rem',
  background: colors.background,
  color: colors.text,
  borderRadius: '6px',
} as const;

const thStyle: React.CSSProperties = {
  padding: '0.25rem 0.6rem',
  textAlign: 'left',
  color: colors.muted,
  fontWeight: 700,
  borderBottom: `1px solid ${colors.edge}`,
} as const;

const tdStyle: React.CSSProperties = {
  padding: '0.2rem 0.6rem',
  border: 'none',
  transition: 'background 300ms ease',
} as const;

const tdChangedStyle: React.CSSProperties = {
  ...tdStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

const activeRowStyle: React.CSSProperties = {
  outline: `2px solid ${colors.active}`,
  outlineOffset: '-2px',
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

const codeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: '0.5rem 0',
  fontSize: '0.75rem',
  lineHeight: 1.45,
  background: colors.background,
  color: colors.muted,
  borderRadius: '6px',
  overflow: 'auto',
  position: 'relative',
} as const;

const codeLineStyle: React.CSSProperties = {
  padding: '0 0.75rem',
  whiteSpace: 'pre',
  marginTop: 0,
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
