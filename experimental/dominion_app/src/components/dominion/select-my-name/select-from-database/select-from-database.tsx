import { Button, FormControl, FormHelperText } from '@material-ui/core'
import * as I from 'immutable'
import { memo, useMemo } from 'react'
import styled from 'styled-components'
import { MySelect } from '~/utils/components/native-select'

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const ButtonsWrapper = styled.div`
  padding: 10px;
`

export const SelectFromDatabase = memo(
  ({
    nameList,
    selectedName,
    selectedNameChange,
    deleteCurrentNameClick,
    renameClick,
    selectedNameIsInGameResults,
  }: Readonly<{
    nameList: I.List<string>
    selectedName: string
    selectedNameChange: (name: string) => void
    deleteCurrentNameClick: () => void
    renameClick: () => void
    selectedNameIsInGameResults: boolean
  }>) => {
    const selectedNameIsInNameList: boolean = useMemo(
      () => nameList.includes(selectedName),
      [nameList, selectedName]
    )

    return (
      <Root>
        <MySelect
          label='Name'
          options={nameList}
          value={selectedName}
          valueChange={selectedNameChange}
        />

        <ButtonsWrapper>
          <FormControl>
            <Button
              variant='contained'
              color='secondary'
              disabled={
                !selectedName ||
                !selectedNameIsInNameList ||
                selectedNameIsInGameResults
              }
              onClick={deleteCurrentNameClick}
            >
              この名前をリストから削除
            </Button>
            {selectedNameIsInGameResults && (
              <FormHelperText>
                この名前はゲーム結果に含まれているので削除できません。
              </FormHelperText>
            )}
          </FormControl>
        </ButtonsWrapper>

        <ButtonsWrapper>
          <FormControl>
            <Button
              variant='contained'
              color='primary'
              disabled={!selectedName}
              onClick={renameClick}
            >
              名前を変更
            </Button>
            {selectedNameIsInGameResults && (
              <FormHelperText>
                過去のゲーム記録の名前もすべて更新されます。
              </FormHelperText>
            )}
          </FormControl>
        </ButtonsWrapper>
      </Root>
    )
  }
)

SelectFromDatabase.displayName = 'SelectFromDatabase'
