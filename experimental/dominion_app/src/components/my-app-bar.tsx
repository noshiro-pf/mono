import React, { memo } from 'react'

import { myName$ } from '~/local-storage-api'
import { useRNValue } from 'rnjs-hooks'

import { MyAppBarView } from './my-app-bar-view'

export const MyAppBar = memo(() => {
  const myName = useRNValue(myName$)

  return <MyAppBarView myName={myName} />
})

MyAppBar.displayName = 'MyAppBar'
