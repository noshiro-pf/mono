import * as I from 'immutable'
import { memo, useCallback, useState } from 'react'
import { combine, merge, RN } from 'rnjs'
import {
  useEventAsStream,
  useRN,
  useRNEffect,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import * as fbc from '~/firebase/firebase-combined-values'
import * as fb from '~/firebase/firebase-worker'
import * as ls from '~/local-storage-api'
import { User } from '~/types/user'
import { executeRename } from './rename-dialog/execute-rename'
import { RenameDialog } from './rename-dialog/rename-dialog'
import { SelectMyNameView } from './select-my-name-view'

export const SelectMyName = memo(() => {
  /* events */

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  // prettier-ignore
  const [waitingForRenaming, setWaitingForRenaming] = useState<boolean>(false)

  const [newNameChange$, newNameChange] = useStateAsStream('')

  // prettier-ignore
  const [selectedNameChange$, selectedNameChange] = useStateAsStream(ls.myName$.value)

  const [tabIndexChange$, tabIndexChange] = useStateAsStream(0)

  const [addNameClick$, addNameClick] = useEventAsStream()
  const [deleteCurrentNameClick$, deleteCurrentNameClick] = useEventAsStream()

  const [nameAfter$, setNameAfter] = useStateAsStream('')

  const tabIndex$: RN<number> = useRN(
    merge(tabIndexChange$, addNameClick$.mapTo(0)).skipUnchanged()
  )

  /* streams */

  const nameList$: RN<I.List<string>> = useRN(
    combine(fbc.nameListFromGameResults$, fb.users$, ls.myName$)
      .map(([fromGRlist, users, lsMyName]) => {
        if (users.isEmpty() || fromGRlist.isEmpty()) return I.List()
        const names = new Set<string>(fromGRlist)
        users.map((u) => names.add(u.name))
        if (!!lsMyName) {
          names.add(lsMyName)
        }
        return I.List(names).sort()
      })
      .skipUnchanged()
  )

  const newName$: RN<string> = useRN(
    merge(newNameChange$, addNameClick$.mapTo('')).skipUnchanged()
  )

  const selectedName$: RN<string> = useRN(
    merge(
      ls.myName$,
      selectedNameChange$,
      addNameClick$.withLatest(newName$).map(([_, n]) => n),
      deleteCurrentNameClick$.mapTo('')
    ).skipUnchanged()
  )

  // select from database tab
  const selectedNameIsInGameResults$: RN<boolean> = useRN(
    combine(fbc.nameListFromGameResults$, selectedName$)
      .map(([list, n]) => list.includes(n))
      .skipUnchanged()
  )

  // add new name tab
  const newNameIsAlreadyUsed$: RN<boolean> = useRN(
    combine(nameList$, newName$)
      .map(([list, name]) => list.includes(name))
      .skipUnchanged()
  )

  // rename dialog
  const nameAfterIsValid$: RN<boolean> = useRN(
    combine(nameList$, selectedName$, nameAfter$)
      .map(
        ([l, before, after]) =>
          after !== '' && before !== after && !l.includes(after)
      )
      .withInitialValue(false)
  )

  const renameDialogErrorMessage$: RN<string> = useRN(
    combine(nameList$, selectedName$, nameAfter$).map<string>(
      ([list, before, after]) => {
        if (!after || before === after) return ''
        if (list.includes(after)) {
          return 'その名前は既に使われています。'
        }
        return ''
      }
    )
  )

  /* extract values */

  const nameList = useRNValue(nameList$)
  const tabIndex = useRNValue(tabIndex$)
  const selectedName = useRNValue(selectedName$, true)

  const newName = useRNValue(newName$, true)
  const selectedNameIsInGameResults = useRNValue(selectedNameIsInGameResults$)
  const newNameIsAlreadyUsed = useRNValue(newNameIsAlreadyUsed$)

  // rename
  const nameAfter = useRNValue(nameAfter$)
  const nameAfterIsValid = useRNValue(nameAfterIsValid$)
  const renameDialogErrorMessage = useRNValue(renameDialogErrorMessage$)

  /* side effects */

  useRNEffect(selectedName$, ls.setMyName)

  useRNEffect(
    addNameClick$
      .withLatest(newName$)
      .map(([_, n]) => n)
      .filter('', (e) => e !== ''),
    (v) => {
      fb.addUser(User({ name: v })).catch(console.log)
    },
    false
  )

  useRNEffect(
    deleteCurrentNameClick$
      .withLatest(selectedName$)
      .map(([_, n]) => n)
      .filter('', (e) => e !== ''),
    (v) => {
      fb.deleteUserByName(v).catch(console.log)
    },
    false
  )

  /* onchanges */

  const renameClick = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const renameDialogOkClick = useCallback(async () => {
    const before = selectedName$.value
    const after = nameAfter$.value
    setWaitingForRenaming(true)
    await executeRename(before, after)
    setDialogOpen(false)
    setWaitingForRenaming(false)
    selectedNameChange(after)
    setNameAfter('')
  }, [
    selectedName$.value,
    nameAfter$.value,
    setWaitingForRenaming,
    setDialogOpen,
    selectedNameChange,
    setNameAfter,
  ])

  const renameDialogCancelClick = useCallback(() => {
    setDialogOpen(false)
  }, [setDialogOpen])

  return (
    <div>
      <SelectMyNameView
        nameList={nameList}
        selectedTabIndex={tabIndex}
        tabChange={tabIndexChange}
        selectedName={selectedName}
        selectedNameChange={selectedNameChange}
        newName={newName}
        newNameChange={newNameChange}
        addNewNameClick={addNameClick}
        deleteCurrentNameClick={deleteCurrentNameClick}
        renameClick={renameClick}
        selectedNameIsInGameResults={selectedNameIsInGameResults}
        newNameIsAlreadyUsed={newNameIsAlreadyUsed}
      />
      <RenameDialog
        open={dialogOpen}
        okClick={renameDialogOkClick}
        cancel={renameDialogCancelClick}
        nameBefore={selectedName}
        nameAfter={nameAfter}
        nameAfterChange={setNameAfter}
        nameAfterIsValid={nameAfterIsValid}
        errorMessage={renameDialogErrorMessage}
        waitingForRenaming={waitingForRenaming}
      />
    </div>
  )

  // logout = () => {
  //   window.history.back();
  // }
})

SelectMyName.displayName = 'SelectMyName'
