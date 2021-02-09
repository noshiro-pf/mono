import { ObjectTableHeaderSetting } from './object-table-header-setting';
import { ITableSettings } from './table-settings';

export interface IObjectTableSettings extends ITableSettings {
  headerSettings: ObjectTableHeaderSetting[];
}
