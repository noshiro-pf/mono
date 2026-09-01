import { type IdType } from '../canvas/index.mjs';

export type AppEventHandler = Readonly<{
  expandLabelList: () => void;
  collapseLabelList: () => void;
  selectLabel: (labelId: IdType) => void;
  showAllLabels: () => void;
  hideAllLabels: () => void;
  flipLabelVisibility: (labelId: IdType) => void;
}>;
