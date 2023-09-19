import { type ChangeEventHandler } from 'react';

export const CodeArea = memoNamed(
  'CodeArea',
  ({
    value,
    valueChange = () => undefined,
    minHeightPx,
    maxHeightPx,
    cyId,
  }: Readonly<{
    value: string;
    valueChange?: (a: string) => void;
    minHeightPx: number;
    maxHeightPx: number;
    cyId: string;
  }>) => {
    const onChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
      (ev) => {
        valueChange(ev.target.value);
      },
      [valueChange]
    );

    const style = useMemo<preact.JSX.CSSProperties>(
      () => ({
        minHeight: `${minHeightPx}px`,
        maxHeight: `${maxHeightPx}px`,
      }),
      [minHeightPx, maxHeightPx]
    );

    return (
      <TextArea
        data-cy={cyId}
        style={style}
        value={value}
        onChange={onChange}
      />
    );
  }
);

const TextArea = styled('textarea')`
  /* size */
  overflow: hidden;
  max-width: 100%;
  width: 100%;
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
