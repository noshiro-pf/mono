import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

type Props = Readonly<{
  message: string;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  onClose: (yn: 'yes' | 'no') => void;
}>;

export const ConfirmDialog = memoNamed<Props>(
  'ConfirmDialog',
  ({ message, isOpen, onClose }) => {
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
      <Dialog onClose={onCloseDefault} open={isOpen}>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelClicked} color='primary'>
            {'Cancel'}
          </Button>
          <Button onClick={okClicked} color='secondary'>
            {'OK'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
