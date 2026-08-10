import { Alert, Dialog } from '@blueprintjs/core';
import styled from '@emotion/styled';

export const DialogWithMaxWidth = styled(Dialog)`
  width: unset;
  max-width: min(90vw, 500px);
`;

export const AlertWithMaxWidth = styled(Alert)`
  width: unset;
  max-width: min(90vw, 500px);
`;
