import { CellPosition } from './cell-position';
import { FilterType } from './filter-type';

export interface IHeaderSetting {
  displayName: string;
  filterType?: FilterType;
  align?: 'l' | 'c' | 'r';
  isButton?: boolean;
  isLink?: boolean;
  sort?: boolean;
  makeSubTable?: boolean;
  subTableHeader?: {
    name: string;
    width: 'narrow' | 'normal' | 'wide';
  }[];
  transform?: undefined | ((value: any, pos?: CellPosition) => string);
  compareFn?: (x: any, y: any) => number;
}

export interface IHeaderSettingFilled extends IHeaderSetting {
  displayName: string;
  filterType: FilterType;
  align: 'l' | 'c' | 'r';
  isButton: boolean;
  isLink: boolean;
  sort: boolean;
  makeSubTable: boolean;
  subTableHeader: {
    name: string;
    width: 'narrow' | 'normal' | 'wide';
  }[];
  transform: undefined | ((value: any, pos?: CellPosition) => string);
  compareFn: (x: any, y: any) => number;
}

export class HeaderSetting implements IHeaderSettingFilled {
  displayName: string;
  filterType: FilterType;
  align: 'l' | 'c' | 'r';
  isButton: boolean;
  isLink: boolean;
  sort: boolean;
  makeSubTable: boolean;
  subTableHeader: {
    name: string;
    width: 'narrow' | 'normal' | 'wide';
  }[];
  transform: undefined | ((value: any, pos?: CellPosition) => string);
  compareFn: (x: any, y: any) => number;

  constructor(initializer?: IHeaderSetting) {
    if (!initializer) {
      this.displayName = '';
      this.filterType = 'none';
      this.align = 'c';
      this.isButton = false;
      this.isLink = false;
      this.sort = false;
      this.makeSubTable = false;
      this.subTableHeader = [];
      this.transform = (value, _) => value.toString();
      this.compareFn = (x: any, y: any) =>
        x.toString().localeCompare(y.toString());
    } else {
      this.displayName = initializer.displayName || '';
      this.filterType = initializer.filterType || 'none';
      this.align = initializer.align || 'c';
      this.isButton = !!initializer.isButton;
      this.isLink = !!initializer.isLink;
      this.sort = !!initializer.sort;
      this.makeSubTable = !!initializer.makeSubTable;
      this.subTableHeader = initializer.subTableHeader || [];
      this.transform = initializer.transform;
      this.compareFn =
        initializer.compareFn ||
        ((x: any, y: any) => x.toString().localeCompare(y.toString()));
    }
  }
}
