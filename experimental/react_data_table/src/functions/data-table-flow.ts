import * as I from 'immutable'
import { combine, merge, RN } from 'rnjs'
import * as obj from 'typescript-utils/functions/object'
import { DataTableState, TDataTableState } from '../types/data-table-state'
import { HeaderValueType } from '../types/header-value-type'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'
import { TSortState } from '../types/sort-state'
import { TableSettings, TTableSettings } from '../types/table-settings'
import { getFilteredIndice } from './get-filtered'
import { getSlicedIndice } from './get-sliced'
import { getSortedIndice } from './get-sorted'
import { initialHeaderValues as getInitialHeaderValues } from './initial-form-state'
import { isValidInput } from './is-valid-input'
import { makeAllSelectOptions } from './make-select-options'
import { makeAllSelectOptionsWithViewValue } from './make-select-options-view-value'
import { transformTable } from './transform-table'

type IHeaderValueChange = {
  columnIndex: number
  value: HeaderValueType
}

export const DataTableDataFlow = (
  fromProps$: RN<[I.List<I.List<any>>, TTableSettings]>,
  itemsPerPageSource$: RN<number>,
  pageNumberSource$: RN<number>,
  headerValueSource$: RN<IHeaderValueChange>,
  sortStateSource$: RN<TSortState>,
  resetAllClick$: RN<void>
): RN<TDataTableState> => {
  const _fromPropsValid$ = fromProps$.filter(
    [I.List(), TableSettings()],
    ([table, settings]) => isValidInput(settings, table)
  )

  const table$ = _fromPropsValid$.map(([table, _]) => table)
  const settings$ = _fromPropsValid$.map(([_, settings]) => settings)

  const tableTransformed$ = _fromPropsValid$.map(([table, settings]) =>
    transformTable(table, settings)
  )

  const selectorOptionsAllValueOnly$: RN<I.List<I.List<any>>> = combine(
    table$,
    settings$
  ).map(([table, settings]) =>
    makeAllSelectOptions(table, settings.columnSettings)
  )

  // RNs

  const headerValueChange$ = headerValueSource$.skipUnchanged()
  const itemsPerPageChange$ = itemsPerPageSource$.skipUnchanged()
  const pageNumberChange$ = pageNumberSource$.skipUnchanged()
  const sortStateChange$ = sortStateSource$.skipUnchanged()

  const initialHeaderValues$: RN<I.List<HeaderValueType>> = combine(
    settings$,
    selectorOptionsAllValueOnly$
  ).map(([settings, options]) => getInitialHeaderValues(settings, options))

  const headerValuesAll$: RN<I.List<HeaderValueType>> =
    initialHeaderValues$.switchMap((initialHeaderValues) =>
      merge(headerValueChange$, resetAllClick$.mapTo<'resetAll'>('resetAll'))
        .scan(
          initialHeaderValues,
          (
            acc: I.List<HeaderValueType>,
            curr: 'resetAll' | IHeaderValueChange
          ) =>
            curr === 'resetAll'
              ? initialHeaderValues
              : acc.set(curr.columnIndex, curr.value)
        )
        .skipUnchanged(I.is)
    )

  const headerValuesAllBuffered$ = settings$
    .pluck('bufferTime')
    .pluck('headerValues')
    .switchMap((t) => headerValuesAll$.debounce(t))

  const sortState$: RN<TSortState> = settings$
    .pluck('sortInit')
    .switchMap((sortInit) =>
      merge(sortStateChange$, resetAllClick$.mapTo(sortInit))
        .withInitialValue(sortInit)
        .skipUnchanged(obj.shallowEq)
    )

  const sortStateBuffered$ = settings$
    .pluck('bufferTime')
    .pluck('sort')
    .switchMap((t) => sortState$.debounce(t))

  // グローバル変数にすると複数のDataTableでcacheが共有されてしまう
  const filterCache = {
    headerValuesAllPrev: I.List(),
    filterResults: [] as boolean[][],
  }

  const filteredIndice$: RN<I.List<number>> = combine(
    headerValuesAllBuffered$,
    table$,
    settings$,
    selectorOptionsAllValueOnly$
  )
    .map(([headerValuesAll, table, settings, selectorOptionsAllValueOnly]) =>
      getFilteredIndice(
        table,
        settings,
        selectorOptionsAllValueOnly,
        headerValuesAll,
        filterCache
      )
    )
    .skipUnchanged()

  const selectorOptionsAllWithViewValue$: RN<
    I.List<I.List<ISelectorOptionWithViewValue>>
  > = combine(
    filteredIndice$,
    table$,
    settings$,
    selectorOptionsAllValueOnly$
  ).map(([filteredIndice, table, settings, selectorOptionsAllValueOnly]) =>
    makeAllSelectOptionsWithViewValue(
      table,
      filteredIndice,
      selectorOptionsAllValueOnly,
      settings.columnSettings
    )
  )

  const filteredLength$: RN<number> = filteredIndice$
    .pluck('size')
    .skipUnchanged()

  const itemsPerPage$: RN<number> = settings$
    .pluck('itemsPerPageInit')
    .switchMap((itemsPerPageInit) =>
      merge(itemsPerPageChange$, resetAllClick$.mapTo(itemsPerPageInit))
        .withInitialValue(itemsPerPageInit)
        .skipUnchanged()
    )

  const itemsPerPageBuffered$ = settings$
    .pluck('bufferTime')
    .pluck('itemsPerPage')
    .switchMap((t) => itemsPerPage$.debounce(t))

  const pageLength$: RN<number> = combine(filteredLength$, itemsPerPage$)
    .map(([length, itemsPerPage]) => Math.ceil(length / itemsPerPage))
    .skipUnchanged()

  const pageNumber$: RN<number> = merge(
    pageNumberChange$,
    pageLength$.mapTo(1),
    resetAllClick$.mapTo(1)
  ).skipUnchanged()

  const pageNumberBuffered$ = settings$
    .pluck('bufferTime')
    .pluck('pageNumber')
    .switchMap((t) => pageNumber$.debounce(t))

  const sortedIndice$: RN<I.List<number>> = combine(
    filteredIndice$,
    sortStateBuffered$,
    table$,
    settings$
  ).map(([filteredIndice, sortState, table, settings]) =>
    getSortedIndice(table, filteredIndice, sortState, settings)
  )

  const slicedIndice$: RN<I.List<number>> = combine(
    itemsPerPageBuffered$,
    pageNumberBuffered$,
    sortedIndice$,
    settings$.pluck('usepagination').skipUnchanged()
  ).map(([itemsPerPage, pageNumber, sortedIndice, usepagination]) =>
    usepagination
      ? getSlicedIndice(sortedIndice, itemsPerPage, pageNumber)
      : sortedIndice
  )

  const tableTransformedSliced$: RN<I.List<[number, I.List<string>]>> = combine(
    tableTransformed$,
    slicedIndice$
  ).map(([tableTransformed, slicedIndice]) =>
    slicedIndice.map(
      (i) =>
        [i, tableTransformed.get(i, I.List<string>())] as [
          number,
          I.List<string>
        ]
    )
  )

  return combine(
    sortState$,
    itemsPerPage$,
    pageNumber$,
    headerValuesAll$,
    selectorOptionsAllWithViewValue$,
    filteredIndice$,
    sortedIndice$,
    slicedIndice$,
    tableTransformedSliced$
  ).map(
    ([
      sortState,
      itemsPerPage,
      pageNumber,
      headerValuesAll,
      selectorOptionsAllWithViewValue,
      filteredIndice,
      sortedIndice,
      slicedIndice,
      tableTransformedSliced,
    ]) =>
      DataTableState({
        sortState,
        itemsPerPage,
        pageNumber,
        headerValuesAll,
        selectorOptionsAll: selectorOptionsAllWithViewValue,
        filteredIndice,
        sortedIndice,
        slicedIndice,
        tableTransformedSliced,
      })
  )
}
