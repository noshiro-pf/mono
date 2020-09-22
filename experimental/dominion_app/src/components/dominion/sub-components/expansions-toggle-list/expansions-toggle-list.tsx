import React, { memo } from 'react'
import * as I from 'immutable'

import { RN, merge, combine } from 'rnjs'
import {
  useStateAsStream,
  useRNValue,
  useEffectFromProps,
  useRNEffect,
  useEventAsStream,
  useRN
} from 'rnjs-hooks'

import { ExpansionsToggleListView } from './expansions-toggle-list-view'

export const ExpansionsToggleList = memo(
  ({
    expansions,
    expansionsChecked: expansionsCheckedInput,
    expansionscheckedOnChange
  }: Readonly<{
    expansions: I.List<string>
    expansionsChecked: I.List<string>
    expansionscheckedOnChange: (v: I.List<string>) => void
  }>) => {
    /* events */

    const [checkChange$, checkOnChange] = useStateAsStream<{
      name: string
      checked: boolean
    }>({ name: '', checked: false })

    const [selectAllClick$, selectAllClick] = useEventAsStream()
    const [deselectAllClick$, deselectAllClick] = useEventAsStream()

    /* from props */

    const [expansions$, setExpansions] = useStateAsStream<I.List<string>>(
      I.List()
    )
    useEffectFromProps(expansions, setExpansions)

    const [
      expansionsCheckedInput$,
      setExpansionsCheckedInput
    ] = useStateAsStream<I.List<string>>(I.List())
    useEffectFromProps(expansionsCheckedInput, setExpansionsCheckedInput)

    /* streams */

    const expansionsChecked$: RN<I.Set<string>> = useRN(
      merge(
        expansionsCheckedInput$.map(v => ({
          id: 'input' as 'input',
          value: v
        })),
        checkChange$.map(v => ({ id: 'change' as 'change', value: v })),
        deselectAllClick$.mapTo({ id: 'deselectAll' as 'deselectAll' }),
        selectAllClick$.withLatest(expansions$).map(([_, expansions]) => ({
          id: 'selectAll' as 'selectAll',
          value: expansions
        }))
      )
        .scan(
          I.Set<string>(),
          (
            acc: I.Set<string>,
            curr:
              | { id: 'input'; value: I.List<string> }
              | { id: 'change'; value: { name: string; checked: boolean } }
              | { id: 'selectAll'; value: I.List<string> }
              | { id: 'deselectAll' }
          ) => {
            switch (curr.id) {
              case 'deselectAll':
                return I.Set()
              case 'selectAll':
                return I.Set(curr.value)
              case 'input':
                return I.Set(curr.value)
              case 'change':
                if (curr.value.checked) {
                  return acc.add(curr.value.name)
                } else {
                  return acc.remove(curr.value.name)
                }
              default:
                return acc
            }
          }
        )
        .skipUnchanged(I.is)
    )

    const expansionsWithCheck$: RN<I.List<[string, boolean]>> = useRN(
      combine(expansions$, expansionsChecked$).map(
        ([expansions, expansionsChecked]) =>
          expansions.map(e => [e, expansionsChecked.has(e)])
      )
    )

    /* side effects */

    useRNEffect(
      expansionsChecked$.map(s => s.toList()),
      expansionscheckedOnChange
    )

    /* extract values */

    const expansionsWithCheck = useRNValue(expansionsWithCheck$)

    return (
      <ExpansionsToggleListView
        expansionsWithCheck={expansionsWithCheck}
        checkOnChange={checkOnChange}
        selectAllClick={selectAllClick}
        deselectAllClick={deselectAllClick}
      />
    )
  }
)

ExpansionsToggleList.displayName = 'ExpansionsToggleList'
