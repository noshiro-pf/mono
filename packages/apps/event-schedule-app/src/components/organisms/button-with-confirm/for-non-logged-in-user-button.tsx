import { introductionUrl, routes } from '../../../constants';
import { router } from '../../../store';
import { AlertWithMaxWidth } from '../../bp';

const dc = dict.forNonLoggedInUser;

type Props = Readonly<{
  isOpen: boolean;
  cancel: () => void;
}>;

const onConfirmClick = (): void => {
  router.push(routes.signInPage);
};

export const ForNonLoggedInUserDialog = memoNamed<Props>(
  'ForNonLoggedInUserDialog',
  ({ isOpen, cancel }) => (
    <AlertWithMaxWidth
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
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
        <SmallerAnchor
          href={introductionUrl}
          rel={'noopener noreferrer'}
          target={'_blank'}
        >
          {dc.link.body}
        </SmallerAnchor>
        <Smaller>{dc.link.suffix}</Smaller>
      </Paragraph>
    </AlertWithMaxWidth>
  )
);

const Paragraph = styled.div`
  margin: 5px 0;
`;

const Smaller = styled.span`
  font-size: smaller;
`;

const SmallerAnchor = styled.a`
  font-size: smaller;
  text-decoration: underline;
`;
