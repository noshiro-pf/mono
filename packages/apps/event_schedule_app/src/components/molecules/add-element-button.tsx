import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';

type Props = Readonly<{
  onClick: () => void;
}>;

export const AddElementButton = memoNamed<Props>(
  'AddElementButton',
  (props) => <BpButton fill={true} icon='plus' onClick={props.onClick} />
);

// const Box = styled.div`
//   background-color: #f1f1f1;
//   border: 1px dashed #cccccc;
//   height: 30px;
// `;
