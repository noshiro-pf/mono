import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useResetPasswordPageState } from '../../hooks';
import { ResetPasswordPageStore } from '../../store';
import { Label } from '../atoms';
import { BpInput } from '../bp';
import { SignInStyled } from '../molecules';

const dc = dict.register;

const returnFalse = (): false => false;

type Props = Readonly<{
  hidePasswordResetForm: () => void;
}>;

export const ResetPasswordPage = memoNamed<Props>(
  'ResetPasswordPage',
  ({ hidePasswordResetForm }) => {
    const { state, emailFormIntent, enterButtonDisabled, enterClickHandler } =
      useResetPasswordPageState();

    return (
      <FormRectWrapper>
        <SignInStyled.FormRect onSubmit={returnFalse}>
          <BackButtonWrapper>
            <Button
              icon={'chevron-left'}
              intent={'none'}
              minimal={true}
              onClick={hidePasswordResetForm}
            >
              {dc.resetPasswordMode.back}
            </Button>
          </BackButtonWrapper>

          <Content>
            <Title>{dc.resetPasswordMode.title}</Title>

            <SignInStyled.FormGroups>
              <FormGroup
                helperText={state.email.error}
                intent={emailFormIntent}
                label={<Label>{dc.email}</Label>}
              >
                <BpInput
                  autoComplete={'email'}
                  autoFocus={true}
                  disabled={state.isWaitingResponse}
                  intent={emailFormIntent}
                  type={'email'}
                  value={state.email.inputValue}
                  onValueChange={ResetPasswordPageStore.inputEmailHandler}
                />
              </FormGroup>
            </SignInStyled.FormGroups>

            <SignInStyled.ButtonWrapper>
              <Button
                disabled={enterButtonDisabled}
                fill={true}
                intent={'primary'}
                loading={state.isWaitingResponse}
                onClick={enterClickHandler}
              >
                {dc.resetPasswordMode.submit}
              </Button>
            </SignInStyled.ButtonWrapper>
          </Content>
        </SignInStyled.FormRect>
      </FormRectWrapper>
    );
  }
);

const FormRectWrapper = styled(SignInStyled.FormRectWrapperBase)`
  height: 320px;
  position: relative;
`;

const BackButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
`;

const Content = styled.div`
  margin-top: 30px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Title = styled.h1`
  font-size: x-large;
  margin-bottom: 20px;
`;
