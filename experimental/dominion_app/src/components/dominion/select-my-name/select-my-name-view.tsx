import { CircularProgress, Divider, Paper } from '@material-ui/core'
import * as I from 'immutable'
import { memo, useMemo } from 'react'
import styled from 'styled-components'
import { ComponentSwitcher } from '~/utils/components/component-switcher'
import { MyTabs } from '~/utils/components/tabs'
import { AddNewName } from './create-new-name/create-new-name'
import { SelectFromDatabase } from './select-from-database/select-from-database'

const CenterWindow = styled.div`
  background-color: white;
  max-width: 90vw;
`

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
`

export const SelectMyNameView = memo(
  ({
    nameList,
    selectedTabIndex,
    tabChange,
    selectedName,
    selectedNameChange,
    newName,
    newNameChange,
    addNewNameClick,
    deleteCurrentNameClick,
    renameClick,
    selectedNameIsInGameResults,
    newNameIsAlreadyUsed,
  }: {
    nameList: I.List<string>
    selectedTabIndex: number
    tabChange: (tabIndex: number) => void
    selectedName: string
    selectedNameChange: (name: string) => void
    newName: string
    newNameChange: (name: string) => void
    addNewNameClick: () => void
    deleteCurrentNameClick: () => void
    renameClick: () => void
    selectedNameIsInGameResults: boolean
    newNameIsAlreadyUsed: boolean
  }) => {
    const loading: boolean = useMemo(
      () =>
        !nameList ||
        nameList.isEmpty() ||
        (selectedName !== '' && nameList.isEmpty()),
      [nameList, selectedName],
    )

    return (
      <FormWrapper>
        {loading ? (
          <CircularProgress />
        ) : (
          <CenterWindow>
            <Paper elevation={1} square={true}>
              <MyTabs
                tabIndex={selectedTabIndex}
                tabIndexChange={tabChange}
                labels={['自分の名前を選択', '新規追加']}
              />

              <Divider />

              <ComponentSwitcher index={selectedTabIndex}>
                <SelectFromDatabase
                  nameList={nameList}
                  selectedName={selectedName}
                  selectedNameChange={selectedNameChange}
                  deleteCurrentNameClick={deleteCurrentNameClick}
                  renameClick={renameClick}
                  selectedNameIsInGameResults={selectedNameIsInGameResults}
                />
                <AddNewName
                  newName={newName}
                  newNameChange={newNameChange}
                  addNewNameClick={addNewNameClick}
                  newNameIsAlreadyUsed={newNameIsAlreadyUsed}
                />
              </ComponentSwitcher>
            </Paper>
          </CenterWindow>
        )}
      </FormWrapper>
    )
  },
)

SelectMyNameView.displayName = 'SelectMyNameView'
