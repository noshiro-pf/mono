import { Alert, Dialog } from '@blueprintjs/core';
import styled from 'styled-components';

export const BpDialog = styled(Dialog)`
  width: unset;
  max-width: min(90vw, 500px);
`;

export const BpAlert = styled(Alert)`
  width: unset;
  max-width: min(90vw, 500px);
`;
