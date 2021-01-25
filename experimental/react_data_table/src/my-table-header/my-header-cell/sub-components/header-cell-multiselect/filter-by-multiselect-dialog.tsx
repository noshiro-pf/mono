import * as I from 'immutable'
import React, { memo, useCallback } from 'react'
import { combine, merge, RN } from 'rnjs'
import {
  useEffectFromProps,
  useEventAsStream,
  useRN,
  useRNEffect,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import * as num from 'typescript-utils/functions/number'
import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'
import { FilterByMultiselectDialogView } from './filter-by-multiselect-dialog-view'

export const FilterByMultiselectDialog = memo(
  ({
    open,
    okClick: okClickInput,
    cancelClick,
    title,
    selectorOptions,
    selectedIndice: selectedIndiceInput,
  }: Readonly<{
    open: boolean
    okClick: (selectedIndice: I.List<number>) => void
    cancelClick: () => void
    title: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndice: I.List<number>
  }>) => {
    /* from props */

    // prettier-ignore
    const [selectedIndiceInput$, setSelectedIndiceInput]
      = useStateAsStream<I.List<number>>(I.List())

    useEffectFromProps(selectedIndiceInput, setSelectedIndiceInput)

    // prettier-ignore
    const [selectorOptionsInput$, setSelectorOptionsInput]
      = useStateAsStream<I.List<ISelectorOptionWithViewValue>>(I.List())

    useEffectFromProps(selectorOptions, setSelectorOptionsInput)

    /* from events */

    const [flip$, flip] = useStateAsStream(-1)
    const [selectAllClick$, selectAllClickEmit] = useEventAsStream()
    const [deselectAllClick$, deselectAllClickEmit] = useEventAsStream()
    const [cancelClick$, cancelClickEmit] = useEventAsStream()
    const [okClick$, okClick] = useEventAsStream()

    /* streams */

    const selectedIndice$: RN<I.List<number>> = useRN(
      combine(
        selectedIndiceInput$,
        selectorOptionsInput$.map((list) => list.map((_, i) => i))
      ).switchMap(([init, selectorOps]) =>
        merge(
          flip$,
          selectAllClick$.mapTo<'selectAllClick'>('selectAllClick'),
          deselectAllClick$.mapTo<'deselectAllClick'>('deselectAllClick'),
          cancelClick$.mapTo<'cancelClick'>('cancelClick'),
          okClick$.mapTo<'okClick'>('okClick')
        )
          .scan(I.Set<number>(init), (acc: I.Set<number>, curr) => {
            switch (curr) {
              case 'deselectAllClick':
                return acc.clear()
              case 'selectAllClick':
                return I.Set(selectorOps)
              case 'cancelClick':
                return I.Set(init)
              case 'okClick':
                return acc
              default:
                return acc.has(curr) ? acc.delete(curr) : acc.add(curr)
            }
          })
          .map((s) => I.List(s).sort(num.cmp))
      )
    )

    /* side effects */

    useRNEffect(
      okClick$.withLatest(selectedIndice$),
      ([_, idc]) => okClickInput(idc),
      false
    )

    useRNEffect(cancelClick$, () => cancelClick(), false)

    /* onclicks */

    const selectAllClick = useCallback(
      (deselect: boolean) => {
        if (deselect) {
          deselectAllClickEmit()
        } else {
          selectAllClickEmit()
        }
      },
      [deselectAllClickEmit, selectAllClickEmit]
    )

    /* extract values */

    const selectedIndice = useRNValue(selectedIndice$)

    return (
      <FilterByMultiselectDialogView
        open={open}
        title={title}
        selectorOptions={selectorOptions}
        cancel={cancelClickEmit}
        okClick={okClick}
        flip={flip}
        selectAllClick={selectAllClick}
        selectedIndice={selectedIndice}
      />
    )
  }
)

FilterByMultiselectDialog.displayName = 'FilterByMultiselectDialog'
