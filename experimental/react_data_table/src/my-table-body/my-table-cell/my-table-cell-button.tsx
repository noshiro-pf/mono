import { Button } from '@material-ui/core'
import React, { CSSProperties, memo } from 'react'

const buttonStyle: CSSProperties = {
  fontWeight: 700,
}

export const MyTableCellButton = memo(
  ({
    value,
    onClick,
  }: Readonly<{
    value: string
    onClick: () => void
  }>) => (
    <Button variant='outlined' style={buttonStyle} onClick={onClick} fullWidth>
      {value}
    </Button>
  )
)

MyTableCellButton.displayName = 'MyTableCellButton'
