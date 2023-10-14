import { utils } from '../../utilities';
import { IHeaderSettingFilled } from '../types/header-setting';
import { SelectorOption } from '../types/selector-option';

export const makeSelectOptions = (
  table: any[][],
  tableFiltered: any[][],
  headerSettings: IHeaderSettingFilled[],
): SelectorOption[][] => {
  const selectorOptions: SelectorOption[][] = headerSettings.map(() => []); // initialize

  if (!table || table.length === 0) {
    return selectorOptions;
  }

  for (let colIndex = 0; colIndex < headerSettings.length; ++colIndex) {
    const col = table.map((line) => line[colIndex]);
    const colFiltered = tableFiltered.map((line) => line[colIndex]);

    const header = headerSettings[colIndex];

    if (
      header.filterType !== 'select' &&
      header.filterType !== 'multiSelect-or' &&
      header.filterType !== 'multiSelect-and'
    ) {
      selectorOptions[colIndex] = [];
      continue;
    }

    if (!Array.isArray(col[0])) {
      selectorOptions[colIndex] = utils.array
        .uniq(col)
        .sort(header.compareFn)
        .map((e) => ({
          value: e,
          viewValue:
            (header.transform ? header.transform(e) : e) +
            `(${colFiltered.filter((cell: any) => cell === e).length})`,
        }));
    } else {
      selectorOptions[colIndex] = utils.array
        .uniq(utils.array.expandAndCombine(col))
        .sort(header.compareFn)
        .map((e) => ({
          value: e,
          viewValue:
            (header.transform ? header.transform(e) : e) +
            `(${colFiltered.filter((cell: any[]) => cell.includes(e)).length})`,
        }));
    }
  }

  return selectorOptions;
};
