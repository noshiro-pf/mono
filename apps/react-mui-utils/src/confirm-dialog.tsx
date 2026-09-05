import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { memoNamed } from 'react-utils';

type Props = Readonly<{
  message: string;
  isOpen: boolean;

  onClose: (yn: 'yes' | 'no') => void;
}>;

export const ConfirmDialog = memoNamed<Props>(
  'ConfirmDialog',
  ({ message, isOpen, onClose }) => {
    const onCloseDefault = React.useCallback(() => {
      onClose('no');
    }, [onClose]);

    const cancelClicked = React.useCallback(() => {
      onClose('no');
    }, [onClose]);

    const okClicked = React.useCallback(() => {
      onClose('yes');
    }, [onClose]);

    return (
      <Dialog open={isOpen} onClose={onCloseDefault}>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button color={'primary'} onClick={cancelClicked}>
            {'Cancel'}
          </Button>
          <Button color={'secondary'} onClick={okClicked}>
            {'OK'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
