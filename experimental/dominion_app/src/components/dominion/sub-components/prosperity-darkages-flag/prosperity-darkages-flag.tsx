import { Chip } from '@material-ui/core'
import { memo } from 'react'
import styled from 'styled-components'

const ChipWrapper = styled.div`
  padding: 5px;
`

const Root = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

export const ProsperityDarkAgesFlag = memo(
  ({
    Prosperity,
    DarkAges,
  }: Readonly<{
    Prosperity: boolean
    DarkAges: boolean
  }>) => (
    <Root>
      {Prosperity && (
        <ChipWrapper>
          <Chip label='植民地場' color='secondary' />
        </ChipWrapper>
      )}
      {DarkAges && (
        <ChipWrapper>
          <Chip label='避難所場' color='secondary' />
        </ChipWrapper>
      )}
    </Root>
  ),
)

ProsperityDarkAgesFlag.displayName = 'ProsperityDarkAgesFlag'
