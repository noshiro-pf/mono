import { Button } from '@blueprintjs/core';
import styled from 'styled-components';

export namespace SignInStyled {
  export const Wrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
  `;

  export const Centering = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  `;

  export const FormRectWrapperBase = styled.div`
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

  export const FormRect = styled.form`
    display: flex;
    flex-direction: column;
    align-items: stretch;
  `;

  export const FormGroups = styled.div``;

  export const PasswordResetWrapper = styled.div`
    margin: 10px 0;
    display: flex;
    justify-content: center;
  `;

  export const PasswordReset = styled.div`
    color: #106ba3;
    cursor: pointer;
    font-size: 12px;
  `;

  export const ButtonWrapper = styled.div`
    margin: 10px 0;
  `;

  export const OtherErrorMessages = styled.div`
    color: red;
    font-size: 12px;
    margin: 10px 0;
    max-height: 50px;
    overflow-y: auto;
  `;

  export const SeparatorWrapper = styled.div`
    height: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `;

  export const Separator = styled.hr`
    margin: 0;
    width: 100%;
    position: absolute;
  `;

  export const SepText = styled.div`
    background: #ffffff;
    text-align: center;
    padding: 0 15px;
    color: darkgray;
    position: absolute;
  `;

  export const GoogleButton = styled(Button)`
    padding: 11px 12px;
  `;

  export const GoogleButtonContentWrapper = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 18px;
  `;

  export const GoogleLoginButtonText = styled.span`
    font-family: 'Roboto';
    font-weight: 600;
    font-size: 14px;
    color: #6d6d6d;
  `;

  export const GoogleIconWrapper = styled.span`
    padding-right: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
}
