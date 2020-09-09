import React, { memo } from 'react'
import * as I from 'immutable'

import { RN, combine, merge } from 'rnjs'
import {
  useRNValue,
  useEventAsStream,
  useStateAsStream,
  useEffectFromProps,
  useRN
} from 'rnjs-hooks'
import * as num from 'typescript-utils/functions/number'

import * as fb from '~/firebase/firebase-worker'

import {
  DCardProperty,
  TDCardProperty,
  DCardPropertytoStr
} from '~/types/dcard-property'

import { DCardPropertyDialogView } from './dcard-property-dialog-view'

export const DCardPropertyListDialog = memo(
  ({
    open,
    closeDialog,
    filteredIndice: filteredIndiceInput,
    indexInFilteredListInit: indexInFilteredListInitInput
  }: Readonly<{
    open: boolean
    closeDialog: () => void
    filteredIndice: I.List<number>
    indexInFilteredListInit: number
  }>) => {
    /* events */
    const [decrementIndex$, decrementIndex] = useEventAsStream()
    const [incrementIndex$, incrementIndex] = useEventAsStream()

    /* from props */
    // prettier-ignore
    const [filteredIndiceInput$, setFilteredIndiceInput]
      = useStateAsStream<I.List<number>>(I.List());
    useEffectFromProps(filteredIndiceInput, setFilteredIndiceInput)

    // prettier-ignore
    const [indexInFilteredListInitInput$, setIndexInFilteredListInitInput]
      = useStateAsStream<number>(0);
    useEffectFromProps(
      indexInFilteredListInitInput,
      setIndexInFilteredListInitInput
    )

    /* streams */

    // filtered
    const filteredIndice$ = useRN(filteredIndiceInput$.skipUnchanged())
    const indexInFilteredListInit$ = useRN(
      indexInFilteredListInitInput$.skipUnchanged()
    )

    // combined
    const indexInFilteredList$: RN<number> = useRN(
      indexInFilteredListInit$
        .switchMap(v =>
          merge(decrementIndex$.mapTo(-1), incrementIndex$.mapTo(1)).scan(
            v,
            num.add
          )
        )
        .skipUnchanged()
    )

    const indexInCardlist$: RN<number> = useRN(
      combine(filteredIndice$, indexInFilteredList$)
        .map(([indice, index]) => indice.get(index, 0))
        .skipUnchanged()
    )

    const dcard$: RN<TDCardProperty> = useRN(
      combine(indexInCardlist$, fb.dcardlist$)
        .map(([indexInCardlist, dcardlist]) =>
          dcardlist.get(indexInCardlist, DCardProperty())
        )
        .skipUnchanged()
    )

    const dcardForView$ = useRN(dcard$.map(DCardPropertytoStr))

    /* extract values */

    const dcard = useRNValue(dcard$)
    const dcardForView = useRNValue(dcardForView$)
    const dcardIndex = useRNValue(indexInFilteredList$)

    return (
      <DCardPropertyDialogView
        open={open}
        closeDialog={closeDialog}
        dcard={dcard}
        dcardForView={dcardForView}
        dcardIndex={dcardIndex}
        filteredIndice={filteredIndiceInput}
        goToPreviousCard={decrementIndex}
        goToNextCard={incrementIndex}
      />
    )
  }
)

DCardPropertyListDialog.displayName = 'DCardPropertyListDialog'
