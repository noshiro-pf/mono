import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { frameTitle, GROUP_HEADER, GROUP_PADDING } from '../dag/index.mjs';
import { m } from '../i18n/index.mjs';
import { groupEditorStore } from '../store/index.mjs';
import type { DagFrameRecord } from './dag-canvas-scene.mjs';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  record: InitializedObservable<DagFrameRecord>;
}>;

/**
 * A group: a frame with rounded corners round its nodes, drawn under them, and
 * its title along the top. The title is what is grabbed to drag the frame, with
 * its nodes, and what a tap, or Enter or Space when focused, opens the group's
 * dialog with; inside the frame, a press pans as one on the background does. An
 * empty group is drawn the same, round nothing.
 */
export const DagGroupFrame = ({ record }: Props): JSX.Element => {
  const { id } = record.getSnapshot().value.frame;

  const title = view(record, (r) => r.title);

  return (
    <g
      class={view(
        record,
        ({ frame, dragging }) =>
          `dag-group${frame.empty ? ' empty' : ''}${dragging ? ' dragging' : ''}`,
      )}
      data-drop={view(record, ({ drop }) => drop)}
      data-e2e={constant('dag-group')}
      transform={view(
        record,
        ({ frame }) => `translate(${frame.x} ${frame.y})`,
      )}
    >
      <rect
        class={constant('dag-group-frame')}
        height={view(record, ({ frame }) => frame.height)}
        rx={constant(GROUP_CORNER_RADIUS)}
        width={view(record, ({ frame }) => frame.width)}
      />
      {/* An SVG has no <button>: the title takes its role, focus and keys. */}
      {}
      <g
        aria-label={view(record, (r) => m.dag.group(r.title))}
        class={constant('dag-group-header')}
        data-e2e={constant('dag-group-header')}
        data-group-id={constant(id)}
        role={constant('button')}
        tabindex={constant(0)}
        onClick={() => {
          groupEditorStore.open(id);
        }}
        onKeyDown={(pressed) => {
          if (pressed.key !== 'Enter' && pressed.key !== ' ') {
            return;
          }

          pressed.preventDefault();

          groupEditorStore.open(id);
        }}
      >
        <SvgTitle>{title}</SvgTitle>
        <rect
          class={constant('dag-group-header-area')}
          height={constant(GROUP_HEADER)}
          rx={constant(GROUP_CORNER_RADIUS)}
          width={view(record, ({ frame }) => frame.width)}
        />
        <text
          class={constant('dag-group-title')}
          dominant-baseline={constant('central')}
          x={constant(GROUP_PADDING)}
          y={constant(GROUP_HEADER / 2)}
        >
          {view(record, (r) => frameTitle(r.title, r.frame.width))}
        </text>
      </g>
    </g>
  );
};

const GROUP_CORNER_RADIUS = 12;
