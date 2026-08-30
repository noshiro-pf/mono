import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { AlertWithMaxWidth } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { introductionUrl, Routes } from '../../../constants/index.mjs';
import { Router } from '../../../store/index.mjs';

const dc = dict.forNonLoggedInUser;

type Props = Readonly<{ isOpen: boolean; cancel: () => void }>;

const onConfirmClick = (): void => {
  Router.push(Routes.routes.signInPage);
};

export const ForNonLoggedInUserDialog = memoNamed<Props>(
  'ForNonLoggedInUserDialog',
  ({ isOpen, cancel }) => (
    <AlertWithMaxWidth
      canEscapeKeyCancel
      canOutsideClickCancel
      cancelButtonText={dict.common.buttonText.cancel}
      confirmButtonText={dc.confirmButton}
      icon={'lock'}
      intent={'primary'}
      isOpen={isOpen}
      onCancel={cancel}
      onConfirm={onConfirmClick}
    >
      <p>{dc.message}</p>
      <Paragraph>
        <Smaller>{dc.description}</Smaller>
      </Paragraph>
      <Paragraph>
        <Smaller>{dc.link.prefix}</Smaller>
        <a
          css={css`
            font-size: smaller;
            text-decoration: underline;
          `}
          href={introductionUrl}
          rel={'noopener noreferrer'}
          target={'_blank'}
        >
          {dc.link.body}
        </a>
        <Smaller>{dc.link.suffix}</Smaller>
      </Paragraph>
    </AlertWithMaxWidth>
  ),
);

const Paragraph = styled.div`
  margin: 5px 0;
`;

const Smaller = styled.span`
  font-size: smaller;
`;
