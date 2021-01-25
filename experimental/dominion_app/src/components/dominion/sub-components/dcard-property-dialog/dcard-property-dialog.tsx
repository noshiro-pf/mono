import React, { memo } from 'react'
import { combine, RN } from 'rnjs'
import {
  useEffectFromProps,
  useRN,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import * as fb from '~/firebase/firebase-worker'
import {
  DCardProperty,
  DCardPropertytoStr,
  TDCardProperty,
} from '~/types/dcard-property'
import { DCardPropertyDialogView } from './dcard-property-dialog-view'

export const DCardPropertyDialog = memo(
  ({
    open,
    closeDialog,
    dcardIndex,
  }: Readonly<{
    open: boolean
    closeDialog: () => void
    dcardIndex: number
  }>) => {
    // combined
    const [dcardIndex$, setDcardIndex] = useStateAsStream(-1)
    useEffectFromProps(dcardIndex, setDcardIndex)

    const card$: RN<TDCardProperty> = useRN(
      combine(dcardIndex$, fb.dcardlist$)
        .map(([dcardIndex, dcardlist]) =>
          dcardlist.get(dcardIndex, DCardProperty())
        )
        .skipUnchanged()
    )

    const cardForView$ = useRN(card$.map(DCardPropertytoStr))

    /* extract values */

    const card = useRNValue(card$)
    const cardForView = useRNValue(cardForView$)

    return (
      <DCardPropertyDialogView
        open={open}
        closeDialog={closeDialog}
        dcard={card}
        dcardForView={cardForView}
        dcardIndex={dcardIndex}
      />
    )
  }
)

DCardPropertyDialog.displayName = 'DCardPropertyDialog'
