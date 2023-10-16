import { type IdType, type Label } from '../canvas';
import { labelInit, labels } from '../constants';
import { visibleLabelsReducer } from '../functions';
import { type AppEventHandler } from '../types';

const {
  state$: sideBarIsHidden$,
  setTrue: hideSideBar,
  setFalse: showSideBar,
} = createBooleanState(false);

const [visibleLabelIndices$, visibleLabelIndicesDispatcher] = createReducer(
  visibleLabelsReducer,
  labels.map(() => true),
);

const { state$: selectedLabel$, setState: setSelectedLabel } =
  createState<Label>(labelInit);

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
};

const visibleLabels$ = visibleLabelIndices$.chain(
  mapI((visibleLabelIndices) =>
    labels.filter((_, i) => visibleLabelIndices[i] === true),
  ),
);

export {
  handlers,
  hideSideBar,
  selectLabel,
  selectedLabel$,
  showSideBar,
  sideBarIsHidden$,
  visibleLabelIndices$,
  visibleLabelIndicesDispatcher,
  visibleLabels$,
};
