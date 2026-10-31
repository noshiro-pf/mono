import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';

type Props<A> = Readonly<{
  source: InitializedObservable<A>;
  /** The edge's label and the box it sits in; no box, no label. */
  pick: (value: A) => Labelled;
}>;

/**
 * An edge's label, `SS` for start-to-start and the lag, in a box on the middle
 * of the edge (`dag-edge.tsx`) or at the apex of the arc (`dag-arc-edge.tsx`).
 */
export const DagEdgeLabel = <A,>({ source, pick }: Props<A>): JSX.Element => {
  const box = (value: A): LabelBox => pick(value).labelBox ?? NO_BOX;

  return (
    <If
      cond={view(source, (value) => pick(value).labelBox !== undefined)}
      then={
        <g class={constant('dag-edge-label')}>
          <rect
            height={view(source, (value) => box(value).height)}
            rx={constant(4)}
            width={view(source, (value) => box(value).width)}
            x={view(source, (value) => box(value).x)}
            y={view(source, (value) => box(value).y)}
          />
          <text
            dominant-baseline={constant('central')}
            text-anchor={constant('middle')}
            x={view(source, (value) => box(value).x + box(value).width / 2)}
            y={view(source, (value) => box(value).y + box(value).height / 2)}
          >
            {view(source, (value) => pick(value).label)}
          </text>
        </g>
      }
    />
  );
};

type LabelBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

type Labelled = Readonly<{ label: string; labelBox: LabelBox | undefined }>;

const NO_BOX: LabelBox = { x: 0, y: 0, width: 0, height: 0 } as const;
