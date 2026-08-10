import * as React from 'react';
import {
  DepGraph,
  type DepGraphStyles,
  type EdgeDef,
  type NodeDef,
} from './dep-graph.js';

export const DataTableGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} styles={styles} />
));

DataTableGraph.displayName = 'DataTableGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'nameInput',
    label: 'NameInput',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 0,
    col: 0,
  },
  {
    id: 'emailInput',
    label: 'EmailInput',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 1,
    col: 0,
  },
  {
    id: 'genderInput',
    label: 'GenderInput',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 2,
    col: 0,
  },
  {
    id: 'headerValues',
    label: 'headerValues',
    sublabel: '(debounced & combined)',
    color: '#6366f1',
    row: 1,
    col: 1,
  },
  {
    id: 'tableData',
    label: 'TableData',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 1,
    col: 3,
  },
  {
    id: 'itemsPerPageInput',
    label: 'ItemsPerPageInput',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 3,
    col: 0,
  },
  {
    id: 'itemsPerPage',
    label: 'ItemsPerPage',
    sublabel: '(debounced & clamped)',
    color: '#6366f1',
    row: 3,
    col: 1,
  },
  {
    id: 'tableFiltered',
    label: 'TableFiltered',
    sublabel: '(derived)',
    color: '#6366f1',
    row: 3,
    col: 3,
  },
  {
    id: 'pageLength',
    label: 'PageLength',
    sublabel: '(derived)',
    color: '#6366f1',
    row: 5,
    col: 1,
  },
  {
    id: 'currentPageInput',
    label: 'CurrentPageInput',
    sublabel: '(source)',
    color: '#f59e0b',
    row: 7,
    col: 0,
  },
  {
    id: 'currentPage',
    label: 'CurrentPage',
    sublabel: '(debounced & clamped)',
    color: '#6366f1',
    row: 7,
    col: 1,
  },
  {
    id: 'tableSliced',
    label: 'TableSliced',
    sublabel: '(output)',
    color: '#10b981',
    row: 8,
    col: 3,
  },
] as const;

const edges: readonly EdgeDef[] = [
  {
    from: 'nameInput',
    to: 'headerValues',
  },
  {
    from: 'emailInput',
    to: 'headerValues',
  },
  {
    from: 'genderInput',
    to: 'headerValues',
  },
  {
    from: 'headerValues',
    to: 'tableFiltered',
    label: 'filter',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'tableData',
    to: 'tableFiltered',
    label: 'filter',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'itemsPerPageInput',
    to: 'itemsPerPage',
  },
  {
    from: 'itemsPerPage',
    to: 'pageLength',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'tableFiltered',
    to: 'pageLength',
    fromSide: 'left',
    toSide: 'top',
  },
  {
    from: 'currentPageInput',
    to: 'currentPage',
  },
  {
    from: 'pageLength',
    to: 'currentPage',
    label: 'reset to 1',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'itemsPerPage',
    to: 'tableSliced',
    label: 'slice',
    toSide: 'top',
  },
  {
    from: 'tableFiltered',
    to: 'tableSliced',
    label: 'slice',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'currentPage',
    to: 'tableSliced',
    label: 'slice',
    fromSide: 'right',
    toSide: 'top',
  },
] as const;

const styles: DepGraphStyles = {
  NODE_WIDTH: 130,
  H_GAP: 40,
  NODE_HEIGHT: 48,
  FONT_SIZE: 13,
  SUB_FONT_SIZE: 11,
} as const;
