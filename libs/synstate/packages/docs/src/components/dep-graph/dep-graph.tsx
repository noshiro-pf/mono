import * as React from 'react';
import { asSafeUint, range } from 'ts-data-forge';
import { type SmallUint } from 'ts-type-forge';

type Props = Readonly<{
  nodes: readonly NodeDef[];
  edges: readonly EdgeDef[];
  styles?: DepGraphStyles;
}>;

export const DepGraph = React.memo<Props>((props) => {
  const styles: DepGraphStylesFilled = {
    NODE_WIDTH: props.styles?.NODE_WIDTH ?? 150,
    NODE_HEIGHT: props.styles?.NODE_HEIGHT ?? 52,
    NODE_RX: props.styles?.NODE_RX ?? 8,
    H_GAP: props.styles?.H_GAP ?? 75,
    V_GAP: props.styles?.V_GAP ?? 30,
    ARROW_SIZE: props.styles?.ARROW_SIZE ?? 6,
    FONT_SIZE: props.styles?.FONT_SIZE ?? 16,
    SUB_FONT_SIZE: props.styles?.SUB_FONT_SIZE ?? 13,
    EDGE_FONT_SIZE: props.styles?.EDGE_FONT_SIZE ?? 11,
  } as const;

  const positioned: readonly PositionedNode[] = props.nodes.map((n) => ({
    ...n,
    ...getNodePixelPosition(n, styles),
  }));

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  const maxCol = Math.max(...props.nodes.map((n) => n.col), 0);

  const maxRow = Math.max(...props.nodes.map((n) => n.row), 0);

  // Extend SVG dimensions to include edge via-waypoints that may lie
  // outside the node grid.
  const viaPixels: readonly Vec2[] = props.edges.flatMap((e) =>
    (e.via ?? []).map((v) => getGridPixelCenter(v.col, v.row, styles)),
  );

  const svgWidth = Math.max(
    (maxCol + 1) * (styles.NODE_WIDTH + styles.H_GAP) - styles.H_GAP,
    ...viaPixels.map((v) => v.x),
  );

  const svgHeight = Math.max(
    (maxRow + 1) * (styles.NODE_HEIGHT + styles.V_GAP) - styles.V_GAP,
    ...viaPixels.map((v) => v.y),
  );

  const pad = 16;

  const svgStyle = React.useMemo<React.CSSProperties>(
    () => ({
      width: '100%',
      maxWidth: `${String(svgWidth + pad * 2)}px`,
      height: 'auto',
    }),
    [svgWidth, pad],
  );

  return (
    <svg
      role={'img'}
      style={svgStyle}
      viewBox={`${String(-pad)} ${String(-pad)} ${String(svgWidth + pad * 2)} ${String(svgHeight + pad * 2)}`}
    >
      <defs>
        <marker
          id={'arrow'}
          markerHeight={styles.ARROW_SIZE}
          markerWidth={styles.ARROW_SIZE}
          orient={'auto-start-reverse'}
          refX={'12'}
          refY={'6'}
          viewBox={'0 0 12 12'}
        >
          <polyline
            fill={'none'}
            points={'4,0 12,6 4,12'}
            stroke={'var(--sl-color-gray-3, #6b7280)'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
            strokeWidth={1.5}
          />
        </marker>
      </defs>

      {/* Edges */}
      {props.edges.map((e) => {
        const from = nodeMap.get(e.from);

        const to = nodeMap.get(e.to);

        if (from === undefined || to === undefined) return undefined;

        const edgeKey = `${e.from}-${e.to}` as const;

        const edgeParams: EdgeParams = {
          fromNode: from,
          toNode: to,
          fromSide: e.fromSide ?? 'right',
          toSide: e.toSide ?? 'left',
          via: e.via,
          styles,
        } as const;

        const d = buildEdgePath(edgeParams);

        const labelPos =
          e.label !== undefined ? getEdgeMidpoint(edgeParams) : undefined;

        return (
          <g key={edgeKey}>
            <path
              d={d}
              fill={'none'}
              markerEnd={'url(#arrow)'}
              stroke={'var(--sl-color-gray-3, #6b7280)'}
              strokeWidth={1.5}
            />
            {e.label !== undefined && labelPos !== undefined ? (
              <>
                <rect
                  fill={'var(--sl-color-bg, #fff)'}
                  height={styles.EDGE_FONT_SIZE + 4}
                  rx={3}
                  width={e.label.length * styles.EDGE_FONT_SIZE * 0.6 + 8}
                  x={
                    labelPos.x -
                    (e.label.length * styles.EDGE_FONT_SIZE * 0.6 + 8) / 2
                  }
                  y={labelPos.y - (styles.EDGE_FONT_SIZE + 4) / 2}
                />
                <text
                  dominantBaseline={'central'}
                  fill={'var(--sl-color-gray-3, #6b7280)'}
                  fontFamily={'system-ui, -apple-system, sans-serif'}
                  fontSize={styles.EDGE_FONT_SIZE}
                  textAnchor={'middle'}
                  x={labelPos.x}
                  y={labelPos.y}
                >
                  {e.label}
                </text>
              </>
            ) : undefined}
          </g>
        );
      })}

      {/* Nodes */}
      {positioned.map((n) => (
        <g key={n.id}>
          <rect
            fill={n.color}
            height={styles.NODE_HEIGHT}
            rx={styles.NODE_RX}
            width={styles.NODE_WIDTH}
            x={n.x}
            y={n.y}
          />
          <text
            dominantBaseline={'middle'}
            fill={'#fff'}
            fontFamily={'system-ui, -apple-system, sans-serif'}
            fontSize={styles.FONT_SIZE}
            fontWeight={600}
            textAnchor={'middle'}
            x={n.x + styles.NODE_WIDTH / 2}
            y={
              n.sublabel !== undefined
                ? n.y + styles.NODE_HEIGHT / 2 - 6
                : n.y + styles.NODE_HEIGHT / 2 + 1
            }
          >
            {n.label}
          </text>
          {n.sublabel !== undefined ? (
            <text
              dominantBaseline={'middle'}
              fill={'rgba(255,255,255,0.8)'}
              fontFamily={'system-ui, -apple-system, sans-serif'}
              fontSize={styles.SUB_FONT_SIZE}
              textAnchor={'middle'}
              x={n.x + styles.NODE_WIDTH / 2}
              y={n.y + styles.NODE_HEIGHT / 2 + 10}
            >
              {n.sublabel}
            </text>
          ) : undefined}
        </g>
      ))}
    </svg>
  );
});

DepGraph.displayName = 'DepGraph';

export type NodeDef = Readonly<{
  id: string;
  label: string;
  sublabel?: string;
  color: string;
  col: SmallUint;
  row: SmallUint;
}>;

export type EdgeDef = Readonly<{
  from: string;
  to: string;
  fromSide?: Side;
  toSide?: Side;
  via?: readonly Readonly<{ col: number; row: number }>[];
  label?: string;
}>;

export type Side = 'top' | 'right' | 'bottom' | 'left';

export type DepGraphStyles = Partial<DepGraphStylesFilled>;

type DepGraphStylesFilled = Readonly<{
  NODE_WIDTH: number;
  NODE_HEIGHT: number;
  NODE_RX: number;
  H_GAP: number;
  V_GAP: number;
  ARROW_SIZE: number;
  FONT_SIZE: number;
  SUB_FONT_SIZE: number;
  EDGE_FONT_SIZE: number;
}>;

type Vec2 = Readonly<{ x: number; y: number }>;

type PositionedNode = NodeDef & Vec2;

const getNodePixelPosition = (
  node: NodeDef,
  styles: DepGraphStylesFilled,
): Vec2 =>
  ({
    x: node.col * (styles.NODE_WIDTH + styles.H_GAP),
    y: node.row * (styles.NODE_HEIGHT + styles.V_GAP),
  }) as const;

const getGridPixelCenter = (
  col: number,
  row: number,
  styles: DepGraphStylesFilled,
): Vec2 =>
  ({
    x: col * (styles.NODE_WIDTH + styles.H_GAP) + styles.NODE_WIDTH / 2,
    y: row * (styles.NODE_HEIGHT + styles.V_GAP) + styles.NODE_HEIGHT / 2,
  }) as const;

const getAnchor = (
  node: PositionedNode,
  side: Side,
  styles: DepGraphStylesFilled,
): Vec2 => {
  switch (side) {
    case 'right':
      return {
        x: node.x + styles.NODE_WIDTH,
        y: node.y + styles.NODE_HEIGHT / 2,
      };
    case 'left':
      return { x: node.x, y: node.y + styles.NODE_HEIGHT / 2 };
    case 'top':
      return { x: node.x + styles.NODE_WIDTH / 2, y: node.y };
    case 'bottom':
      return {
        x: node.x + styles.NODE_WIDTH / 2,
        y: node.y + styles.NODE_HEIGHT,
      };
  }
};

/** Outward-pointing unit tangent perpendicular to the given side. */
const getOutwardTangent = (side: Side): Vec2 => {
  switch (side) {
    case 'right':
      return { x: 1, y: 0 };
    case 'left':
      return { x: -1, y: 0 };
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
  }
};

const dist = (a: Vec2, b: Vec2): number => Math.hypot(b.x - a.x, b.y - a.y);

const normalize = (v: Vec2): Vec2 => {
  const len = Math.hypot(v.x, v.y);

  // eslint-disable-next-line total-functions/no-partial-division
  return len === 0 ? { x: 1, y: 0 } : { x: v.x / len, y: v.y / len };
};

type EdgeParams = Readonly<{
  fromNode: PositionedNode;
  toNode: PositionedNode;
  fromSide: Side;
  toSide: Side;
  via: readonly Readonly<{ col: number; row: number }>[] | undefined;
  styles: DepGraphStylesFilled;
}>;

/**
 * Compute waypoints, tangents, and capped control-point offsets for an edge.
 * Shared by both `buildEdgePath` and `getEdgeMidpoint`.
 */
const resolveEdgeGeometry = (
  params: EdgeParams,
): Readonly<{
  points: readonly Vec2[];
  tangents: readonly Vec2[];
  startAnchor: Vec2;
}> => {
  const { fromNode, toNode, fromSide, toSide, via, styles } = params;

  const startAnchor = getAnchor(fromNode, fromSide, styles);

  const endAnchor = getAnchor(toNode, toSide, styles);

  const viaPixels: readonly Vec2[] = (via ?? []).map((v) =>
    getGridPixelCenter(v.col, v.row, styles),
  );

  const points: readonly Vec2[] = [
    startAnchor,
    ...viaPixels,
    endAnchor,
  ] as const;

  const tangents: readonly Vec2[] = points.map((_, i) => {
    if (i === 0) {
      return getOutwardTangent(fromSide);
    }

    if (i === points.length - 1) {
      const outward = getOutwardTangent(toSide);

      return { x: -outward.x, y: -outward.y };
    }

    return normalize({
      x: (points[i + 1]?.x ?? 0) - (points[i - 1]?.x ?? 0),
      y: (points[i + 1]?.y ?? 0) - (points[i - 1]?.y ?? 0),
    });
  });

  return { points, tangents, startAnchor };
};

/**
 * Compute the capped bezier control-point offsets for a single segment.
 * Horizontal tangents (left/right) get a wider cap than vertical ones
 * (top/bottom) since the grid is typically wider than it is tall.
 */
const computeControlPoints = (
  p0: Vec2,
  p1: Vec2,
  t0: Vec2,
  t1: Vec2,
  styles: DepGraphStylesFilled,
): Readonly<{ cx1: number; cy1: number; cx2: number; cy2: number }> => {
  const baseAlpha = dist(p0, p1) * 0.4;

  const hMax = styles.NODE_WIDTH + styles.H_GAP;

  const vMax = styles.NODE_HEIGHT + styles.V_GAP;

  const alpha0 = Math.min(baseAlpha, t0.y === 0 ? hMax : vMax);

  const alpha1 = Math.min(baseAlpha, t1.y === 0 ? hMax : vMax);

  return {
    cx1: p0.x + t0.x * alpha0,
    cy1: p0.y + t0.y * alpha0,
    cx2: p1.x - t1.x * alpha1,
    cy2: p1.y - t1.y * alpha1,
  };
};

/** Compute the midpoint of an edge path (at t=0.5 of the middle segment). */
const getEdgeMidpoint = (params: EdgeParams): Vec2 => {
  const { points, tangents } = resolveEdgeGeometry(params);

  const midSegIdx = Math.floor((points.length - 1) / 2);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const p0 = points[midSegIdx]!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const p1 = points[midSegIdx + 1]!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const t0 = tangents[midSegIdx]!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const t1 = tangents[midSegIdx + 1]!;

  const { cx1, cy1, cx2, cy2 } = computeControlPoints(
    p0,
    p1,
    t0,
    t1,
    params.styles,
  );

  // Cubic bezier at t=0.5
  const t = 0.5;

  const mt = 1 - t;

  return {
    x:
      mt ** 3 * p0.x +
      3 * mt * mt * t * cx1 +
      3 * mt * t * t * cx2 +
      t ** 3 * p1.x,
    y:
      mt ** 3 * p0.y +
      3 * mt * mt * t * cy1 +
      3 * mt * t * t * cy2 +
      t ** 3 * p1.y,
  };
};

const buildEdgePath = (params: EdgeParams): string => {
  const { points, tangents, startAnchor } = resolveEdgeGeometry(params);

  const mut_parts: string[] = [
    `M ${String(startAnchor.x)} ${String(startAnchor.y)}`,
  ];

  for (const i of range(0, asSafeUint(points.length - 1))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p0 = points[i]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p1 = points[i + 1]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const t0 = tangents[i]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const t1 = tangents[i + 1]!;

    const { cx1, cy1, cx2, cy2 } = computeControlPoints(
      p0,
      p1,
      t0,
      t1,
      params.styles,
    );

    mut_parts.push(
      `C ${String(cx1)} ${String(cy1)}, ${String(cx2)} ${String(cy2)}, ${String(p1.x)} ${String(p1.y)}`,
    );
  }

  return mut_parts.join(' ');
};
