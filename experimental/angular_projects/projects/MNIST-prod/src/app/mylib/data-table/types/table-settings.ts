import { SortDirection } from '@angular/material';
import {
  HeaderSetting,
  IHeaderSetting,
  IHeaderSettingFilled,
} from './header-setting';
import { NoColumn } from './no-column';

export interface ITableSettings {
  headerSettings: IHeaderSetting[];
  displayNo?: boolean;
  usepagination?: boolean;
  itemsPerPageOptions?: number[];
  itemsPerPageInit?: number;
  sortInit?: { active: string; direction: SortDirection };
}

export interface ITableSettingsFilled extends ITableSettings {
  headerSettings: IHeaderSettingFilled[];
  displayNo: boolean;
  usepagination: boolean;
  itemsPerPageOptions: number[];
  itemsPerPageInit: number;
  sortInit: { active: string; direction: SortDirection };
}

export class TableSettings implements ITableSettingsFilled {
  headerSettings: IHeaderSettingFilled[];
  displayNo: boolean;
  usepagination: boolean;
  itemsPerPageOptions: number[];
  itemsPerPageInit: number;
  sortInit: { active: string; direction: SortDirection };

  constructor(initializer?: ITableSettings) {
    if (!initializer) {
      this.headerSettings = [];
      this.displayNo = false;
      this.usepagination = true;
      this.itemsPerPageOptions = [25, 50, 100];
      this.itemsPerPageInit = 25;
      this.sortInit = { active: NoColumn, direction: '' };
    } else {
      this.headerSettings = initializer.headerSettings.map(
        (e) => new HeaderSetting(e)
      );
      this.displayNo = !!initializer.displayNo;
      this.usepagination = !!initializer.usepagination;
      this.itemsPerPageOptions = initializer.itemsPerPageOptions || [
        25, 50, 100,
      ];
      this.itemsPerPageInit = initializer.itemsPerPageInit || 25;
      this.sortInit = initializer.sortInit || {
        active: NoColumn,
        direction: '',
      };
    }
  }
}
