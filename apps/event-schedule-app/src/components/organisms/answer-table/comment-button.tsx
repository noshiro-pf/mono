import { Button, Icon, PopoverNext } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { ButtonsWrapperAlignEnd } from '../../styled/index.mjs';

type Props = Readonly<{ comment: string; useSmallButton?: boolean }>;

export const CommentButton = memoNamed<Props>(
  'CommentButton',
  ({ comment, useSmallButton = false }) => {
    const [isOpen, { setTrue: handleOpen, setFalse: handleClose }] =
      useBoolState(false);

    const popoverContent = React.useMemo(
      () => (
        <div
          css={css`
            padding: 10px;
            max-width: 250px;
          `}
        >
          <div
            css={css`
              margin: 10px;
              overflow-wrap: anywhere;
              white-space: pre-line;
            `}
          >
            {comment}
          </div>
          <ButtonsWrapperAlignEnd>
            <Button
              intent={'none'}
              text={dict.common.buttonText.close}
              onClick={handleClose}
            />
          </ButtonsWrapperAlignEnd>
        </div>
      ),
      [comment, handleClose],
    );

    return (
      <PopoverNext
        arrow={false}
        canEscapeKeyClose
        content={popoverContent}
        isOpen={isOpen}
        placement={'top'}
        onClose={handleClose}
      >
        {useSmallButton ? (
          <Button
            css={css`
              min-height: 16px !important;
              min-width: 16px !important;
            `}
            icon={icon}
            size={'small'}
            variant={'minimal'}
            onClick={handleOpen}
          />
        ) : (
          <Button
            icon={'comment'}
            size={'small'}
            variant={'minimal'}
            onClick={handleOpen}
          />
        )}
      </PopoverNext>
    );
  },
);

const icon = <Icon icon={'comment'} size={12} />;
