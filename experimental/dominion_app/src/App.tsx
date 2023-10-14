import { FC } from 'react'
import { timer } from 'rnjs'
import { useRN, useRNValue } from 'rnjs-hooks'
import { myName$ } from '~/local-storage-api'
import { AppView } from './App-view'

const App: FC = () => {
  const snackbarIsOpen$ = useRN(
    myName$.switchMap(() => timer(2000, true).mapTo(false).startWith(true)),
  )

  const myName = useRNValue(myName$)
  const snackbarIsOpen = useRNValue(snackbarIsOpen$)

  return <AppView myName={myName} snackbarOpen={snackbarIsOpen} />
}

export default App
