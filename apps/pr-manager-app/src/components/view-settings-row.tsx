import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import {
  BLOCK_NAMES,
  defaultShareOf,
  type BlockId,
  type ColumnCount,
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
  columns: ColumnCount;
  mode: HeightMode;
  /** Read in the `natural` mode only. */
  height: number | undefined;
  /** Read in the `fill` mode only; absent is the default share. */
  share: number | undefined;
  /** What part of its column the share comes to, in percent. */
  percent: number;
  /** Not drawn on the page; its height or share is kept, but not offered. */
  hidden: boolean;
  /**
   * Nothing in the repository for it — the queue, where there is no
   * `merge-queued` label (`RepoFeatures` in `load-report.mts`) — so it is
   * drawn nowhere, whatever {@link hidden} says, and showing it is not
   * offered. It can still be moved, for a repository that has it.
   */
  absent: boolean;
}>;

/**
 * One block in the layout settings, with a button for each thing the pointer
 * can do to it on the page: up, down, across to the column on its left or
 * its right, and its height — or, when the blocks fill the window, its share
 * of it — and one to hide it or show it again. A hidden block can still be
 * moved, so that it comes back where it is wanted, but its size is not
 * offered until it is shown. A button that could do nothing is left out rather than disabled, so
 * tabbing along the row stops only where something can happen.
 */
export const ViewSettingsRow = memoNamed<Props>('ViewSettingsRow', (props) => {
  const {
    id,
    column,
    index,
    count,
    columns,
    mode,
    height,
    share,
    percent,
    hidden,
    absent,
  } = props;

  const blockName = BLOCK_NAMES[id];

  const up = useCallback((): void => {
    layoutStore.move(id, { column, index: index - 1 });
  }, [id, column, index]);

  const down = useCallback((): void => {
    layoutStore.move(id, { column, index: index + 1 });
  }, [id, column, index]);

  const toLeft = useCallback((): void => {
    layoutStore.move(id, { column: column === 2 ? 1 : 0, index: 0 });
  }, [id, column]);

  const toRight = useCallback((): void => {
    layoutStore.move(id, { column: column === 0 ? 1 : 2, index: 0 });
  }, [id, column]);

  const leftName = column === 2 && columns === 3 ? 'middle' : 'left';

  const rightName = column === 0 && columns === 3 ? 'middle' : 'right';

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
    layoutStore.setShare(id, (share ?? defaultShareOf(id)) - SHARE_STEP);
  }, [id, share]);

  const more = useCallback((): void => {
    layoutStore.setShare(id, (share ?? defaultShareOf(id)) + SHARE_STEP);
  }, [id, share]);

  const usual = useCallback((): void => {
    layoutStore.setShare(id, undefined);
  }, [id]);

  const toggleHidden = useCallback((): void => {
    layoutStore.setHidden(id, !hidden);
  }, [id, hidden]);

  return (
    <li className={'view-settings-block'} data-hidden={hidden}>
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

      {column > 0 ? (
        <button
          aria-label={`Move ${blockName} to the ${leftName} column`}
          className={'view-settings-move'}
          title={`To the ${leftName} column`}
          type={'button'}
          onClick={toLeft}
        >
          {'←'}
        </button>
      ) : undefined}

      {column < columns - 1 ? (
        <button
          aria-label={`Move ${blockName} to the ${rightName} column`}
          className={'view-settings-move'}
          title={`To the ${rightName} column`}
          type={'button'}
          onClick={toRight}
        >
          {'→'}
        </button>
      ) : undefined}

      {absent ? (
        <span
          className={'view-settings-height'}
          title={
            'This repository has no merge-queued label, so there is no queue to draw.'
          }
        >
          {'none here'}
        </span>
      ) : hidden ? (
        <span className={'view-settings-height'}>{'hidden'}</span>
      ) : mode === 'fill' ? (
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

      {absent ? undefined : (
        <button
          aria-label={`${hidden ? 'Show' : 'Hide'} ${blockName}`}
          className={'view-settings-small'}
          type={'button'}
          onClick={toggleHidden}
        >
          {hidden ? 'Show' : 'Hide'}
        </button>
      )}
    </li>
  );
});

/** What "Fix" gives a block that had its natural height. */
const FIRST_HEIGHT = 480;

const HEIGHT_STEP = 80;

/** A quarter of the default share. */
const SHARE_STEP = 25;
