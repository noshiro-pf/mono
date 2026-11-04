import { createBooleanState, createReducer, createState } from 'synstate';
import type { IdType, Label } from '../canvas/index.mjs';
import { labelInit, labels } from '../constants/index.mjs';
import { visibleLabelsReducer } from '../functions/index.mjs';
import type { AppEventHandler } from '../types/index.mjs';

const [labelListIsCollapsed$, { toggle: toggleLabelList }] =
  createBooleanState(false);

const [labelVisibilityFlags$, labelVisibilityFlagsDispatcher] = createReducer(
  visibleLabelsReducer,
  labels.map(() => true),
);

const [selectedLabel$, setSelectedLabel] = createState<Label>(labelInit);

const selectLabel = (labelId: IdType): void => {
  setSelectedLabel(labels.find((l) => l.id === labelId) ?? labelInit);
};

const handlers: AppEventHandler = {
  toggleLabelList,
  showAllLabels: () => {
    labelVisibilityFlagsDispatcher({ type: 'show-all' });
  },
  hideAllLabels: () => {
    labelVisibilityFlagsDispatcher({ type: 'hide-all' });
  },
  flipLabelVisibility: (labelId) => {
    const index = labels.findIndex((l) => l.id === labelId);

    labelVisibilityFlagsDispatcher({ type: 'flip', index });
  },
  selectLabel,
} as const;

export {
  handlers,
  labelListIsCollapsed$,
  labelVisibilityFlags$,
  labelVisibilityFlagsDispatcher,
  selectedLabel$,
  selectLabel,
};
