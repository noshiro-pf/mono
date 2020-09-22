import React, { memo } from 'react'
import { CircularProgress } from '@material-ui/core'

export const Loading = memo(
  ({ width, height }: { width: number; height: number }) => (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,

        // centering
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CircularProgress />
    </div>
  )
)

Loading.displayName = 'Loading'
