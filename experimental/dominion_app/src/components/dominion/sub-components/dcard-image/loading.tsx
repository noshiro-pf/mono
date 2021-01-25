import { CircularProgress } from '@material-ui/core'
import React, { memo } from 'react'

export const Loading = memo(
  ({ width, height }: { width: number; height: number }) => (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,

        // centering
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress />
    </div>
  )
)

Loading.displayName = 'Loading'
