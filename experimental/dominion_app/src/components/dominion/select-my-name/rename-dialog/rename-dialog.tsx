import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core'
import { memo } from 'react'
import { MyInput } from '~/utils/components/native-input'

export const RenameDialog = memo(
  ({
    open,
    okClick,
    cancel,
    nameBefore,
    nameAfter,
    nameAfterChange,
    nameAfterIsValid,
    errorMessage,
    waitingForRenaming,
  }: Readonly<{
    open: boolean
    okClick: () => void
    cancel: () => void
    nameBefore: string
    nameAfter: string
    nameAfterChange: (v: string) => void
    nameAfterIsValid: boolean
    errorMessage: string
    waitingForRenaming: boolean
  }>) => (
    <Dialog open={open} onClose={cancel}>
      {waitingForRenaming ? (
        <DialogContent>名前を変更しています…。</DialogContent>
      ) : (
        <>
          <DialogTitle>名前を変更</DialogTitle>
          <DialogContent>
            <div>変更前： {nameBefore}</div>
            <MyInput
              value={nameAfter}
              valueChange={nameAfterChange}
              label='名前'
              helperText={errorMessage}
              error={!nameAfterIsValid}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              color='primary'
              disabled={!nameAfterIsValid}
              onClick={okClick}
            >
              OK
            </Button>
            <Button color='default' onClick={cancel}>
              Cancel
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  ),
)

RenameDialog.displayName = 'RenameDialog'
