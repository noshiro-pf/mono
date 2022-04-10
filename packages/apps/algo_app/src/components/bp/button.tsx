export const Button = styled('button')`
  text-transform: none;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;

  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 5px 10px;
  text-align: left;
  vertical-align: middle;
  min-height: 30px;
  min-width: 30px;

  background-color: #f5f8fa;
  background-image: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0.8),
    hsla(0, 0%, 100%, 0)
  );
  color: #182026;

  box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
    inset 0 -1px 0 rgb(16 22 26 / 10%);

  &:active {
    background-color: #d8e1e8;
    background-image: none;
    -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
  }

  &:hover {
    background-clip: padding-box;
    background-color: #ebf1f5;
  }

  &:disabled {
    background-color: rgba(206, 217, 224, 0.5);
    background-image: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: rgba(92, 112, 128, 0.6);
    cursor: not-allowed;
    outline: none;
  }
`;

export const ButtonSuccess = styled(Button)`
  background-color: #0f9960;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(hsla(0, 0%, 100%, 0.1)),
    to(hsla(0, 0%, 100%, 0))
  );
  background-image: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0.1),
    hsla(0, 0%, 100%, 0)
  );
  -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
    inset 0 -1px 0 rgb(16 22 26 / 20%);
  box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
    inset 0 -1px 0 rgb(16 22 26 / 20%);
  color: #fff;

  &:active {
    background-color: #0a6640;
    background-image: none;
    -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
  }

  &:hover {
    background-color: #0d8050;
    -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 -1px 0 rgb(16 22 26 / 20%);
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 -1px 0 rgb(16 22 26 / 20%);
  }

  &:disabled {
    background-color: rgba(15, 153, 96, 0.5);
    background-image: none;
    border-color: transparent;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: hsla(0, 0%, 100%, 0.6);
  }
`;

export const ButtonPrimary = styled(Button)`
  background-color: #137cbd;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(hsla(0, 0%, 100%, 0.1)),
    to(hsla(0, 0%, 100%, 0))
  );
  background-image: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0.1),
    hsla(0, 0%, 100%, 0)
  );
  -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
    inset 0 -1px 0 rgb(16 22 26 / 20%);
  box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
    inset 0 -1px 0 rgb(16 22 26 / 20%);
  color: #fff;

  &:active {
    background-color: #0e5a8a;
    background-image: none;
    -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 1px 2px rgb(16 22 26 / 20%);
  }

  &:hover {
    background-color: #106ba3;
    -webkit-box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 -1px 0 rgb(16 22 26 / 20%);
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 40%),
      inset 0 -1px 0 rgb(16 22 26 / 20%);
  }

  &:disabled {
    background-color: rgba(19, 124, 189, 0.5);
    background-image: none;
    border-color: transparent;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: hsla(0, 0%, 100%, 0.6);
  }
`;
