import type { Intent } from '@blueprintjs/core';
import { Button, FormGroup, Spinner } from '@blueprintjs/core';
import { memoNamed, useToggleState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useRegisterPageState } from '../../hooks';
import { BpInput } from '../bp';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';

const dc = dict.register;

const returnFalse = (): false => false;

export const RegisterPage = memoNamed('RegisterPage', () => {
  const {
    state,
    hasError,
    enterClickHandler,
    inputUsernameHandler,
    inputEmailHandler,
    inputPasswordHandler,
    inputPasswordConfirmationHandler,
  } = useRegisterPageState();

  const emailFormIntent: Intent =
    state.error.email === undefined ? 'primary' : 'danger';

  const [showPassword, handleLockClick] = useToggleState(false);

  const passwordFormIntent: Intent =
    state.error.password === undefined &&
    state.error.passwordConfirmation === undefined
      ? 'primary'
      : 'danger';

  return (
    <Wrapper>
      <NavBar />

      <Centering>
        <FormRect onSubmit={returnFalse}>
          <Title>{dc.title.register}</Title>
          <FormGroups>
            <Label>{dc.username}</Label>
            <FormGroup intent={'none'} label={''}>
              <BpInput
                autoComplete={'username'}
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={'primary'}
                type={'text'}
                value={state.inputValue.username}
                onValueChange={inputUsernameHandler}
              />
            </FormGroup>

            <Label>{dc.email}</Label>
            <FormGroup
              helperText={state.error.email}
              intent={emailFormIntent}
              label={''}
            >
              <BpInput
                autoComplete={'email'}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                placeholder={'sample@gmail.com'}
                type={'email'}
                value={state.inputValue.email}
                onValueChange={inputEmailHandler}
              />
            </FormGroup>

            <Label>{dc.password}</Label>
            <FormGroup
              helperText={state.error.password}
              intent={passwordFormIntent}
              label={''}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                type={'password'}
                value={state.inputValue.password}
                onValueChange={inputPasswordHandler}
              />
            </FormGroup>

            <Label>{dc.verifyPassword}</Label>
            <FormGroup
              helperText={state.error.passwordConfirmation}
              intent={passwordFormIntent}
              label={''}
            >
              <BpInput
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    showPassword={showPassword}
                    onLockClick={handleLockClick}
                  />
                }
                type={showPassword ? 'text' : 'password'}
                value={state.inputValue.passwordConfirmation}
                onValueChange={inputPasswordConfirmationHandler}
              />
            </FormGroup>

            <ErrorMessage>{state.error.others}</ErrorMessage>
          </FormGroups>

          <ButtonWrapper>
            <Button
              disabled={hasError || state.isWaitingResponse}
              intent={'primary'}
              type={'submit'}
              onClick={enterClickHandler}
            >
              {state.isWaitingResponse ? (
                <Spinner size={20} />
              ) : (
                <span>{dc.registerButton}</span>
              )}
            </Button>
          </ButtonWrapper>
        </FormRect>
      </Centering>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Centering = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const FormRect = styled.form`
  width: 400px;
  height: 500px;
  min-height: max-content;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const FormGroups = styled.div`
  margin-bottom: 10px;
  width: 220px;
  max-width: 220px;
`;

const Label = styled.div`
  color: #757575;
  font-size: 12px;
  margin-bottom: 5px;
`;

const ButtonWrapper = styled.div`
  margin: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin: 10px 0;
`;
