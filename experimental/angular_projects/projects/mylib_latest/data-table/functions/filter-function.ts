import { utils } from '../../utilities';
import { IHeaderSettingFilled } from '../types/header-setting';


export const filterFn = (
  tableLine: any[],
  headerSettings: IHeaderSettingFilled[],
  headerValuesAll: (any|undefined)[],
): boolean => {
  for ( let colIndex = 0; colIndex < headerSettings.length; ++colIndex ) {
    const headerValue = headerValuesAll[ colIndex ];
    if ( headerValue === undefined ) continue;
    if ( headerValue.length === 0 ) continue;

    const header = headerSettings[ colIndex ];
    const cell = tableLine[ colIndex ];

    /* no mismatches => return true; 1 or more mismatches => return false */
    switch ( header.filterType ) {
      case 'input' :
        if ( typeof cell !== 'string' ) return false;
        if ( typeof headerValue !== 'string' ) return false;
        if ( !utils.string.submatch(
                cell, headerValue, true ) ) return false;
        break;

      case 'select' :
        if ( typeof cell !== 'string' &&
             typeof cell !== 'boolean' &&
             typeof cell !== 'number' ) return false;
        if ( cell !== headerValue ) return false;
        break;

      case 'multiSelect-and' :
        if ( !Array.isArray( headerValue ) ) return false;
        if ( !Array.isArray( cell ) ) return false;
        /* for any e \in headerValue, e \in cell */
        if ( !utils.array.isSubset( headerValue, cell ) ) return false;
        break;

      case 'multiSelect-or' :
        /* headerValueの初期状態はundefinedなのでfilteringされなくなっており，
            headerValueの全選択初期化は不要になっている */
        if ( !Array.isArray( headerValue ) ) return false;
        if ( !Array.isArray( cell ) ) {
          if ( !headerValue.includes( cell ) ) return false;
        } else {
          /* for some e \in headerValue, e \in cell */
          if ( utils.array.setIntersection( headerValue, cell ).length === 0 ) return false;
        }
        break;

      default :
        break;
    }

  }

  return true;
};

