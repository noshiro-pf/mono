import { TableSettings } from '../types/table-settings';
import { isValidTable } from './is-valid-table';
import { IHeaderSettingFilled } from '../types/header-setting';

export const isValidSetting = (settings: TableSettings): boolean => {

  /* settingsに不正な値がある場合 */
  if ( !settings ) return false;
  if ( !settings.headerSettings
        || !settings.itemsPerPageInit
        || !settings.itemsPerPageOptions ) return false;
  if ( typeof settings.displayNo !== 'boolean' ) return false;
  if ( typeof settings.usepagination !== 'boolean' ) return false;
  if ( typeof settings.itemsPerPageInit !== 'number' ) return false;
  if ( !Array.isArray( settings.itemsPerPageOptions ) ) return false;
  if ( !Array.isArray( settings.headerSettings ) ) return false;
  if ( settings.headerSettings.some( e => !isValidHeaderSetting(e) ) ) return false;

  return true;
};



export const isValidSetting_withTable = (settings: TableSettings, table: any[][]): boolean => {

  if ( !isValidSetting( settings ) ) return false;

  /* tableとの齟齬チェック */
  if ( !isValidTable( table ) ) return false;
  if ( settings.headerSettings.length !== table[0].length ) return false;

  return true;
};



export const isValidHeaderSetting = (hsettings: IHeaderSettingFilled): boolean => {
  if ( hsettings.makeSubTable ) {
    if ( hsettings.sort ) return false;
    if ( hsettings.isButton ) return false;
    if ( !hsettings.subTableHeader ||
      hsettings.subTableHeader.length <= 0 ) return false;
  }
  return true;
};
