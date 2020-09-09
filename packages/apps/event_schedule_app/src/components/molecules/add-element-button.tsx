import { Button } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';

// const Box = styled.div`
//   background-color: #f1f1f1;
//   border: 1px dashed #cccccc;
//   height: 30px;
// `;

export const AddElementButton = memoNamed<{
  onClick: () => void;
}>('AddElementButton', ({ onClick }) => (
  <Button icon='plus' fill={true} onClick={onClick} />
));
