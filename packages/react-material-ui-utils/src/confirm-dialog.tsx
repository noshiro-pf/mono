import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@material-ui/core';
import React, { FC, memo, useCallback } from 'react';

type Props = Readonly<{
  message: string;
  open: boolean;
  onClose: (yn: 'yes' | 'no') => void;
}>;

const _ConfirmDialog: FC<Props> = ({ message, open, onClose }: Props) => {
  const onCloseDefault = useCallback(() => {
    onClose('no');
  }, [onClose]);

  const cancelClicked = useCallback(() => {
    onClose('no');
  }, [onClose]);

  const okClicked = useCallback(() => {
    onClose('yes');
  }, [onClose]);

  return (
    <Dialog onClose={onCloseDefault} open={open}>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelClicked} color='primary'>
          Cancel
        </Button>
        <Button onClick={okClicked} color='secondary'>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ConfirmDialog = memo(_ConfirmDialog);
ConfirmDialog.displayName = 'ConfirmDialog';
