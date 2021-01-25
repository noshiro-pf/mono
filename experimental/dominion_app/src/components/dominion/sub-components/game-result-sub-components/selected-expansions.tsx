import { Chip } from '@material-ui/core'
import * as I from 'immutable'
import React, { CSSProperties, memo } from 'react'

const chipStyle: CSSProperties = {
  margin: '5px',
}

export const SelectedExpansions = memo(
  ({
    expansions,
    selectedExpansions,
  }: Readonly<{
    expansions: I.List<string>
    selectedExpansions: I.List<string>
  }>) => (
    <>
      {expansions.map((e, i) => (
        <Chip
          key={i}
          style={chipStyle}
          label={e}
          color={selectedExpansions.includes(e) ? 'secondary' : 'default'}
        />
      ))}
    </>
  )
)

SelectedExpansions.displayName = 'SelectedExpansions'
