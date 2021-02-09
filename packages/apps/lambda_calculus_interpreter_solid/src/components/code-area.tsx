import { styled } from '@mono/solid-styled-components';
import { FunctionType } from '@mono/ts-utils';
import { JSX } from 'solid-js';

export const CodeArea = ({
  value,
  valueChange = (_value: string) => undefined,
  className,
}: {
  value: () => string;
  valueChange?: FunctionType<string, void>;
  className?: string;
}): JSX.Element => {
  const onInput: JSX.EventHandler<HTMLTextAreaElement, Event> = (ev) => {
    valueChange(ev.target.value);
  };

  return <Styled className={className} value={value()} onInput={onInput} />;
};

const Styled = styled('textarea')`
  /* size */
  overflow: hidden;
  max-width: 100%;
  padding: 15px;

  /* border */
  border-radius: 8px;
  box-shadow: inset 0 0 1px 2px #3c3d39, 0 0 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #0b0c0a;

  /* color */
  color: white;
  font-size: 16px;
  font-family: Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  line-height: 1.4;
  caret-color: white;
  background-color: #272822;

  &::placeholder {
    color: #ffffff91;
  }
`;
