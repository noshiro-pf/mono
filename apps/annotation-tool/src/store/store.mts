import { map } from 'synstate';
import {
  createBooleanState,
  createReducer,
  createState,
} from 'synstate-react-hooks';
import { type IdType, type Label } from '../canvas/index.mjs';
import { labelInit, labels } from '../constants/index.mjs';
import { visibleLabelsReducer } from '../functions/index.mjs';
import { type AppEventHandler } from '../types/index.mjs';

// The state creators return tuples now, not objects.
const [useSideBarIsHidden, { setTrue: hideSideBar, setFalse: showSideBar }] =
  createBooleanState(false);

const [, visibleLabelIndicesDispatcher, { state: visibleLabelIndices$ }] =
  createReducer(
    visibleLabelsReducer,
    labels.map(() => true),
  );

const [useSelectedLabel, setSelectedLabel] = createState<Label>(labelInit);

const selectLabel = (labelId: IdType): void => {
  setSelectedLabel(labels.find((l) => l.id === labelId) ?? labelInit);
};

const handlers: AppEventHandler = {
  collapseLabelList: hideSideBar,
  expandLabelList: showSideBar,
  showAllLabels: () => {
    visibleLabelIndicesDispatcher({ type: 'show-all' });
  },
  hideAllLabels: () => {
    visibleLabelIndicesDispatcher({ type: 'hide-all' });
  },
  flipLabelVisibility: (labelId) => {
    const index = labels.findIndex((l) => l.id === labelId);

    visibleLabelIndicesDispatcher({ type: 'flip', index });
  },
  selectLabel,
} as const;

const visibleLabels$ = visibleLabelIndices$.pipe(
  map((visibleLabelIndices) =>
    labels.filter((_, i) => visibleLabelIndices[i] === true),
  ),
);

export {
  handlers,
  hideSideBar,
  selectLabel,
  showSideBar,
  useSelectedLabel,
  useSideBarIsHidden,
  visibleLabelIndicesDispatcher,
  visibleLabels$,
};
