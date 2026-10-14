import type { KeyboardEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import {
  frameTitle,
  GROUP_HEADER,
  GROUP_PADDING,
  type GroupFrame,
} from '../dag/index.mjs';
import { groupEditorStore } from '../store/index.mjs';

type Props = Readonly<{
  frame: GroupFrame;
  title: string;
  /** Being dragged by its title. */
  dragging: boolean;
  /**
   * While a node is dragged: `into` for the frame it would be dropped into,
   * `leave` for the one it would leave, and `undefined` otherwise.
   */
  drop: 'into' | 'leave' | undefined;
}>;

/**
 * A group: a frame with rounded corners round its nodes, drawn under them,
 * and its title along the top. The title is what is grabbed to drag the
 * frame, with its nodes, and what a tap, or Enter or Space when focused,
 * opens the group's dialog with; inside the frame, a press pans as one on
 * the background does. An empty group is drawn the same, round nothing.
 */
export const DagGroupFrame = memoNamed<Props>('DagGroupFrame', (props) => {
  const { frame, title, dragging, drop } = props;

  const openGroup = useCallback(() => {
    groupEditorStore.open(frame.id);
  }, [frame.id]);

  const onKeyDown = useCallback<KeyboardEventHandler<SVGGElement>>(
    (pressed) => {
      if (pressed.key !== 'Enter' && pressed.key !== ' ') {
        return;
      }

      pressed.preventDefault();

      groupEditorStore.open(frame.id);
    },
    [frame.id],
  );

  return (
    <g
      className={`dag-group${frame.empty ? ' empty' : ''}${dragging ? ' dragging' : ''}`}
      data-drop={drop}
      data-e2e={'dag-group'}
      transform={`translate(${frame.x} ${frame.y})`}
    >
      <rect
        className={'dag-group-frame'}
        height={frame.height}
        rx={GROUP_CORNER_RADIUS}
        width={frame.width}
      />
      {/* An SVG has no <button>: the title takes its role, focus and keys. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <g
        aria-label={`グループ「${title}」`}
        className={'dag-group-header'}
        data-e2e={'dag-group-header'}
        data-group-id={frame.id}
        role={'button'}
        // Lower case, as on a node (`dag-task-node.tsx`).
        // eslint-disable-next-line react/no-unknown-property
        tabindex={0}
        onClick={openGroup}
        onKeyDown={onKeyDown}
      >
        <title>{title}</title>
        <rect
          className={'dag-group-header-area'}
          height={GROUP_HEADER}
          rx={GROUP_CORNER_RADIUS}
          width={frame.width}
        />
        <text
          className={'dag-group-title'}
          dominantBaseline={'central'}
          x={GROUP_PADDING}
          y={GROUP_HEADER / 2}
        >
          {frameTitle(title, frame.width)}
        </text>
      </g>
    </g>
  );
});

const GROUP_CORNER_RADIUS = 12;
