import * as I from 'immutable'
import React, { memo } from 'react'
import { combine, fromPromise, RN } from 'rnjs'
import { useRN, useRNValue } from 'rnjs-hooks'
import { rulebooksPath } from '~/constants/route'
import * as fb from '~/firebase/firebase-worker'
import { Rulebook, TRulebook } from '~/types/rulebook'
import { RulebooksView } from './rulebooks-view'

const toImgUrl$ = (filename: string): RN<string> =>
  fromPromise<string>(
    '',
    fb.storage
      .ref(`${fb.paths.storage.rulebookCoverImage}/${filename}`)
      .getDownloadURL()
  )

const toPdfUrl$ = (filename: string): RN<string> =>
  fromPromise<string>(
    '',
    fb.storage
      .ref(`${fb.paths.storage.rulebookPdf}/${filename}`)
      .getDownloadURL()
  )

export const Rulebooks = memo(() => {
  const imgUrls$: RN<string[]> = useRN(
    combine(...rulebooksPath.map((e) => toImgUrl$(e.imgurl)).toArray())
  )

  const pdfUrls$: RN<string[]> = useRN(
    combine(...rulebooksPath.map((e) => toPdfUrl$(e.pdfurl)).toArray())
  )

  const rulebooks$: RN<I.List<TRulebook>> = useRN(
    combine(imgUrls$, pdfUrls$).map(([imgUrls, pdfUrls]) =>
      rulebooksPath.map((rb, i) =>
        Rulebook({
          title: rb.title,
          imgurl: imgUrls[i],
          pdfurl: pdfUrls[i],
        })
      )
    )
  )

  const rulebooks = useRNValue(rulebooks$)

  return <RulebooksView rulebooks={rulebooks} />
})

Rulebooks.displayName = 'Rulebooks'
