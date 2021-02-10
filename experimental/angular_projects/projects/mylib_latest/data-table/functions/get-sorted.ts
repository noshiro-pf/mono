import { Sort } from '@angular/material';
import { TableSettings } from '../types/table-settings';
import { NoColumn } from '../types/no-column';

export const getSorted = (
  tableFilteredIndexed: { val: any[], idx: number }[],
  sortBy: Sort,
  settings: TableSettings,
): { val: any, idx: number }[] => {
  const tableFilteredWithIndiceCopy = tableFilteredIndexed.slice();
  if ( sortBy.direction === '' ) return tableFilteredWithIndiceCopy;
  if ( sortBy.active !== NoColumn ) {
    const colIndex = Number( sortBy.active );
    const cmp = settings.headerSettings[colIndex].compareFn;

    if ( !Array.isArray( tableFilteredWithIndiceCopy[0].val[0] ) ) {
      tableFilteredWithIndiceCopy.sort( (x, y) =>
        cmp( x.val[colIndex], y.val[colIndex] ) );
    } else { // 要素の辞書順ソート
      lexicalSort( tableFilteredWithIndiceCopy, cmp );
    }
  }
  return ( sortBy.direction === 'desc'
              ? tableFilteredWithIndiceCopy.reverse()
              : tableFilteredWithIndiceCopy );
};



const lexicalSort = <T>(
  tableWithIndice: { val: any, idx: number }[],
  cmp: (a: T, b: T) => number
): { val: any, idx: number }[] => {
  // return indice.sort( (x, y) => lexicalCmp( data[x], data[y], cmp ) );
  return tableWithIndice.sort( (x, y) => lexicalCmp( x.val, y.val, cmp ) );
};

const lexicalCmp = <T>(
  x: T[],
  y: T[],
  cmp: (a: T, b: T) => number
): number => {
  const maxIndex = Math.max( x.length, y.length );
  for ( let i = 0; i < maxIndex; ++i ) {
    const c = cmp( x[i], y[i] );
    if ( c < 0 ) {
      return -1;
    } else if ( c > 0 ) {
      return 1;
    } else {  // c === 0
      continue;
    }
  }
  return (x.length - y.length);
};



