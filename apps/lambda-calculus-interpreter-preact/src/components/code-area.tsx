import { styled } from 'goober';
import { memoNamed } from 'preact-utils';
import * as Preact from 'preact/hooks';

export const CodeArea = memoNamed(
  'CodeArea',
  ({
    caption,
    value,
    valueChange,
    minHeightPx,
    maxHeightPx,
    cyId,
  }: Readonly<{
    /** The visible caption; the `<label>` around the area makes it its name. */
    caption: string;
    value: string;
    valueChange?: (a: string) => void;
    minHeightPx: number;
    maxHeightPx: number;
    cyId: string;
  }>) => {
    const onChange = Preact.useCallback(
      (ev: Readonly<{ target: EventTarget | null }>) => {
        if (ev.target instanceof HTMLTextAreaElement) {
          valueChange?.(ev.target.value);
        }
      },
      [valueChange],
    );

    const style = Preact.useMemo(
      () => ({
        minHeight: `${minHeightPx}px`,
        maxHeight: `${maxHeightPx}px`,
      }),
      [minHeightPx, maxHeightPx],
    );

    return (
      <Field>
        {caption}
        <TextArea
          data-e2e={cyId}
          // Without a handler the area shows output only.
          readOnly={valueChange === undefined}
          style={style}
          value={value}
          onChange={onChange}
        />
      </Field>
    );
  },
);

const Field = styled('label')`
  display: block;
`;

const TextArea = styled('textarea')`
  /* size */
  overflow: auto;
  max-width: 100%;
  width: 100%;
  padding: 15px;

  /* border */
  border-radius: 8px;
  box-shadow:
    inset 0 0 1px 2px #3c3d39,
    0 0 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #0b0c0a;

  /* color */
  color: white;
  font-size: 16px;
  font-family: Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  line-height: 1.4;
  caret-color: white;
  background-color: #272822;
  /* a dark scrollbar on the dark background */
  color-scheme: dark;

  &::placeholder {
    color: #ffffff91;
  }
`;
