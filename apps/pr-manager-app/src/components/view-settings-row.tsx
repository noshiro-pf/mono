import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import {
  BLOCK_NAMES,
  DEFAULT_SHARE,
  type BlockId,
  type ColumnIndex,
  type HeightMode,
} from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

type Props = Readonly<{
  id: BlockId;
  column: ColumnIndex;
  /** Its place in its column, and how many the column holds. */
  index: number;
  count: number;
  twoColumns: boolean;
  mode: HeightMode;
  /** Read in the `natural` mode only. */
  height: number | undefined;
  /** Read in the `fill` mode only; absent is the default share. */
  share: number | undefined;
  /** What part of its column the share comes to, in percent. */
  percent: number;
}>;

/**
 * One block in the layout settings, with a button for each thing the pointer
 * can do to it on the page: up, down, across to the other column, and its
 * height — or, when the blocks fill the window, its share of it. A button that could do nothing is left out rather than disabled,
 * so tabbing along the row stops only where something can happen.
 */
export const ViewSettingsRow = memoNamed<Props>('ViewSettingsRow', (props) => {
  const { id, column, index, count, twoColumns, mode, height, share, percent } =
    props;

  const blockName = BLOCK_NAMES[id];

  const up = useCallback((): void => {
    layoutStore.move(id, { column, index: index - 1 });
  }, [id, column, index]);

  const down = useCallback((): void => {
    layoutStore.move(id, { column, index: index + 1 });
  }, [id, column, index]);

  const across = useCallback((): void => {
    layoutStore.move(id, { column: column === 0 ? 1 : 0, index: 0 });
  }, [id, column]);

  const shorter = useCallback((): void => {
    layoutStore.setHeight(id, (height ?? FIRST_HEIGHT) - HEIGHT_STEP);
  }, [id, height]);

  const taller = useCallback((): void => {
    layoutStore.setHeight(
      id,
      height === undefined ? FIRST_HEIGHT : height + HEIGHT_STEP,
    );
  }, [id, height]);

  const natural = useCallback((): void => {
    layoutStore.setHeight(id, undefined);
  }, [id]);

  const less = useCallback((): void => {
    layoutStore.setShare(id, (share ?? DEFAULT_SHARE) - SHARE_STEP);
  }, [id, share]);

  const more = useCallback((): void => {
    layoutStore.setShare(id, (share ?? DEFAULT_SHARE) + SHARE_STEP);
  }, [id, share]);

  const usual = useCallback((): void => {
    layoutStore.setShare(id, undefined);
  }, [id]);

  return (
    <li className={'view-settings-block'}>
      <span className={'view-settings-name'}>{blockName}</span>

      {index > 0 ? (
        <button
          aria-label={`Move ${blockName} up`}
          className={'view-settings-move'}
          title={'Up'}
          type={'button'}
          onClick={up}
        >
          {'↑'}
        </button>
      ) : undefined}

      {index < count - 1 ? (
        <button
          aria-label={`Move ${blockName} down`}
          className={'view-settings-move'}
          title={'Down'}
          type={'button'}
          onClick={down}
        >
          {'↓'}
        </button>
      ) : undefined}

      {twoColumns ? (
        <button
          aria-label={`Move ${blockName} to the ${column === 0 ? 'right' : 'left'} column`}
          className={'view-settings-move'}
          title={column === 0 ? 'To the right column' : 'To the left column'}
          type={'button'}
          onClick={across}
        >
          {column === 0 ? '→' : '←'}
        </button>
      ) : undefined}

      {mode === 'fill' ? (
        <>
          <span
            className={'view-settings-height'}
            title={'Its part of the column'}
          >
            {`${percent}%`}
          </span>

          <button
            aria-label={`Give ${blockName} less of the column`}
            className={'view-settings-move'}
            title={'Less'}
            type={'button'}
            onClick={less}
          >
            {'−'}
          </button>

          <button
            aria-label={`Give ${blockName} more of the column`}
            className={'view-settings-move'}
            title={'More'}
            type={'button'}
            onClick={more}
          >
            {'+'}
          </button>

          {share === undefined ? undefined : (
            <button
              aria-label={`Give ${blockName} the usual share of the column`}
              className={'view-settings-small'}
              type={'button'}
              onClick={usual}
            >
              {'Usual'}
            </button>
          )}
        </>
      ) : height === undefined ? (
        <>
          <span className={'view-settings-height'}>{'natural height'}</span>

          <button
            aria-label={`Give ${blockName} a height of its own, with a scroll`}
            className={'view-settings-small'}
            type={'button'}
            onClick={taller}
          >
            {'Fix'}
          </button>
        </>
      ) : (
        <>
          <span className={'view-settings-height'}>{`${height}px`}</span>

          <button
            aria-label={`Make ${blockName} shorter`}
            className={'view-settings-move'}
            title={'Shorter'}
            type={'button'}
            onClick={shorter}
          >
            {'−'}
          </button>

          <button
            aria-label={`Make ${blockName} taller`}
            className={'view-settings-move'}
            title={'Taller'}
            type={'button'}
            onClick={taller}
          >
            {'+'}
          </button>

          <button
            aria-label={`Give ${blockName} its natural height`}
            className={'view-settings-small'}
            type={'button'}
            onClick={natural}
          >
            {'Natural'}
          </button>
        </>
      )}
    </li>
  );
});

/** What "Fix" gives a block that had its natural height. */
const FIRST_HEIGHT = 480;

const HEIGHT_STEP = 80;

/** A quarter of the default share. */
const SHARE_STEP = 25;
