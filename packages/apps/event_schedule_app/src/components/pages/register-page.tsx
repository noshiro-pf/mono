import type { Intent } from '@blueprintjs/core';
import { Button, FormGroup, Spinner } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useRegisterPageState } from '../../hooks';
import { BpInput } from '../bp';
import { NavBar } from '../organisms';

const dc = dict.register;

export const RegisterPage = memoNamed('RegisterPage', () => {
  const {
    state,
    hasError,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    inputUsernameHandler,
  } = useRegisterPageState();

  const emailFormIntent: Intent =
    state.error.email === undefined ? 'primary' : 'danger';

  const passwordFormIntent: Intent =
    state.error.password === undefined ? 'primary' : 'danger';

  return (
    <Wrapper>
      <NavBar />

      <Centering>
        <FormRect>
          <FormGroups>
            <Label>{dc.email}</Label>
            <FormGroup
              helperText={state.error.email}
              intent={emailFormIntent}
              label={''}
            >
              <BpInput
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                placeholder={'sample@gmail.com'}
                type='email'
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
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                type='password'
                value={state.inputValue.password}
                onValueChange={inputPasswordHandler}
              />
            </FormGroup>

            <Label>{dc.username}</Label>
            <FormGroup intent={'none'} label={''}>
              <BpInput
                disabled={state.isWaitingResponse}
                intent={'primary'}
                type='text'
                value={state.inputValue.username}
                onValueChange={inputUsernameHandler}
              />
            </FormGroup>

            <ErrorMessage>{state.error.others}</ErrorMessage>
          </FormGroups>

          <ButtonWrapper>
            <Button
              disabled={hasError || state.isWaitingResponse}
              intent='primary'
              type='submit'
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

const FormRect = styled.div`
  width: 400px;
  height: 400px;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormGroups = styled.div`
  margin-bottom: 10px;
  width: 220px;
  max-width: 220px;
`;

const Label = styled.div`
  font-weight: bold;
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
