import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { aboutThisAppUrl } from '../../constants/index.mjs';

export const Footer = memoNamed('Footer', () => (
  <div
    css={css`
      padding: 10px;
      display: flex;
      justify-content: flex-end;
    `}
  >
    <a href={aboutThisAppUrl} rel={'noopener noreferrer'} target={'_blank'}>
      {dict.aboutThisApp}
    </a>
  </div>
));
