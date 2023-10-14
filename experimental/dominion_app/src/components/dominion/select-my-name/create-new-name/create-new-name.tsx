import { Button } from '@material-ui/core'
import { memo, useMemo } from 'react'
import styled from 'styled-components'
import { MyInput } from '~/utils/components/native-input'

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const ButtonWrapper = styled.div`
  padding: 10px;
`

export const AddNewName = memo(
  ({
    newName,
    newNameChange,
    addNewNameClick,
    newNameIsAlreadyUsed,
  }: Readonly<{
    newName: string
    newNameChange: (name: string) => void
    addNewNameClick: () => void
    newNameIsAlreadyUsed: boolean
  }>) => {
    const helperText = useMemo(
      () => (newNameIsAlreadyUsed ? 'その名前は既に使われています。' : ''),
      [newNameIsAlreadyUsed],
    )

    return (
      <Root>
        <MyInput
          value={newName}
          valueChange={newNameChange}
          label='名前'
          required={true}
          error={newNameIsAlreadyUsed}
          helperText={helperText}
        />

        <ButtonWrapper>
          <Button
            variant='contained'
            color='primary'
            disabled={newNameIsAlreadyUsed || !newName}
            onClick={addNewNameClick}
          >
            新規追加
          </Button>
        </ButtonWrapper>
      </Root>
    )
  },
)

AddNewName.displayName = 'AddNewName'
