import { Button } from '@blueprintjs/core';

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

const FormRectWrapperBase = styled.div`
  width: 340px;
  min-height: max-content;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  display: flex;
  flex-direction: column;
  align-items: stretch;

  padding: 40px 50px;
`;

const FormRect = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FormGroups = styled.div``;

const PasswordResetWrapper = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: center;
`;

const PasswordReset = styled.div`
  color: #106ba3;
  cursor: pointer;
  font-size: 12px;
`;

const ButtonWrapper = styled.div`
  margin: 10px 0;
`;

const OtherErrorMessages = styled.div`
  color: red;
  font-size: 12px;
  margin: 10px 0;
  max-height: 50px;
  overflow-y: auto;
`;

const SeparatorWrapper = styled.div`
  height: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Separator = styled.hr`
  margin: 0;
  width: 100%;
  position: absolute;
`;

const SepText = styled.div`
  background: #ffffff;
  text-align: center;
  padding: 0 15px;
  color: darkgray;
  position: absolute;
`;

const GoogleButton = styled(Button)`
  padding: 11px 12px;
`;

const GoogleButtonContentWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 18px;
`;

const GoogleLoginButtonText = styled.span`
  font-family: 'Roboto';
  font-weight: 600;
  font-size: 14px;
  color: #6d6d6d;
`;

const GoogleIconWrapper = styled.span`
  padding-right: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SignInStyled = {
  Wrapper,
  Centering,
  FormRectWrapperBase,
  FormRect,
  FormGroups,
  PasswordResetWrapper,
  PasswordReset,
  ButtonWrapper,
  OtherErrorMessages,
  SeparatorWrapper,
  Separator,
  SepText,
  GoogleButton,
  GoogleButtonContentWrapper,
  GoogleLoginButtonText,
  GoogleIconWrapper,
} as const;
