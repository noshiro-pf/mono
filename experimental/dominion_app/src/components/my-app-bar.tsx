import { memo } from 'react'
import { useRNValue } from 'rnjs-hooks'
import { myName$ } from '~/local-storage-api'
import { MyAppBarView } from './my-app-bar-view'

export const MyAppBar = memo(() => {
  const myName = useRNValue(myName$)

  return <MyAppBarView myName={myName} />
})

MyAppBar.displayName = 'MyAppBar'
