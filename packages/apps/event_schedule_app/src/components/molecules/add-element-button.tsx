import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { BpButton } from '../atoms/blueprint-js-wrapper/button';

interface Props {
  onClick: () => void;
}

export const AddElementButton = memoNamed<Props>(
  'AddElementButton',
  (props) => <BpButton icon='plus' fill={true} onClick={props.onClick} />
);

// const Box = styled.div`
//   background-color: #f1f1f1;
//   border: 1px dashed #cccccc;
//   height: 30px;
// `;
