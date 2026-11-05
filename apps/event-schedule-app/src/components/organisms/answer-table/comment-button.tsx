import { Button, Icon, Popover } from 'blueprint-synstate';
import { createBooleanState } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { ButtonsWrapperAlignEnd } from '../../styled/index.mjs';
import * as styles from './answer-table.module.css';

type Props = Readonly<{ comment: Bindable<string>; useSmallButton?: boolean }>;

export const CommentButton = ({
  comment,
  useSmallButton = false,
}: Props): JSX.Element => {
  const [isOpen$, { setTrue: handleOpen, setFalse: handleClose }] =
    createBooleanState(false);

  return (
    <Popover
      arrow={false}
      canEscapeKeyClose
      content={
        <div class={constant(styles.commentPopover)}>
          <div class={constant(styles.commentText)}>{comment}</div>
          <ButtonsWrapperAlignEnd>
            <Button
              intent={'none'}
              text={constant(dict.common.buttonText.close)}
              onClick={handleClose}
            />
          </ButtonsWrapperAlignEnd>
        </div>
      }
      isOpen={isOpen$}
      placement={'top'}
      onClose={handleClose}
    >
      {useSmallButton ? (
        <Button
          class={styles.smallCommentButton}
          iconElement={<Icon icon={'comment'} size={12} />}
          size={'small'}
          variant={constant('minimal')}
          onClick={handleOpen}
        />
      ) : (
        <Button
          icon={'comment'}
          size={'small'}
          variant={constant('minimal')}
          onClick={handleOpen}
        />
      )}
    </Popover>
  );
};
