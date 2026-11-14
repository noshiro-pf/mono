import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Optional } from 'ts-data-forge';
import {
  drawnColumns,
  type BlockId,
  type DrawnGroup,
  type Layout,
} from '../domain/index.mjs';
import type { UrlField } from './url-store.mjs';

export type LayoutStore = Readonly<{
  layout: InitializedObservable<Layout>;
  /** The blocks this repository does not have (the queue without its label). */
  absent: InitializedObservable<readonly BlockId[]>;
  /** The columns as drawn. */
  drawn: InitializedObservable<readonly (readonly DrawnGroup[])[]>;
  /** Applies a change from `domain/layout` to the layout. */
  change: (fn: (layout: Layout) => Layout) => void;
  get: () => Layout;
  getAbsent: () => readonly BlockId[];
  dialogOpen: InitializedObservable<boolean>;
  setDialogOpen: (open: boolean) => void;
}>;

/** The layout (spec §6), kept in the URL, and the dialog that changes it. */
export const createLayoutStore = (
  deps: Readonly<{
    field: UrlField<Layout>;
    absent: InitializedObservable<readonly BlockId[]>;
  }>,
): LayoutStore => {
  const [dialogOpen, setDialogOpen] = createState(false);

  return {
    layout: deps.field.value,
    absent: deps.absent,
    drawn: combine([deps.field.value, deps.absent]).pipe(
      map(([layout, absent]) => drawnColumns(layout, absent)),
    ),
    change: (fn) => {
      deps.field.update(fn);
    },
    get: deps.field.get,
    getAbsent: () => Optional.unwrap(deps.absent.getSnapshot()),
    dialogOpen,
    setDialogOpen: (open) => {
      setDialogOpen(open);
    },
  };
};
