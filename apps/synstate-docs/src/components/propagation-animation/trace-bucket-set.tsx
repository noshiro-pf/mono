import * as React from 'react';
import { Arr } from 'ts-data-forge';
import {
  colors,
  fieldNameStyle,
  valueChangedStyle,
  valueStyle,
} from './trace-shared.mjs';
import { undefinedText, type BucketSet } from './trace-step.mjs';

type Props = Readonly<{
  set: BucketSet;
  level: number;
  changed: ReadonlySet<string>;
}>;

/**
 * One bucket set: a row per depth index, its slots, and its length. A slot at
 * or past the length is not in use, and is drawn faded.
 */
export const TraceBucketSet = React.memo<Props>((props) => {
  const { set, level, changed } = props;

  const prefix = `buckets.${level.toString()}` as const;

  return (
    <div style={bucketSetStyle}>
      <span style={fieldNameStyle}>{`bucketSets[${level.toString()}]`}</span>
      {Arr.isEmpty(set) ? (
        <span style={valueStyle}>{'[]'}</span>
      ) : (
        set.map(({ nodes, length: used }, index) => {
          const i = index.toString();

          return (
            // eslint-disable-next-line react/no-array-index-key -- a bucket is identified by its depth index
            <div key={index} style={bucketRowStyle}>
              <span style={fieldNameStyle}>{`[${i}].nodes`}</span>
              <span style={cellsStyle}>
                {Arr.isEmpty(nodes) ? (
                  <span style={valueStyle}>{'[]'}</span>
                ) : (
                  nodes.map((v, slot) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key -- a slot is identified by its position in the bucket
                      key={slot}
                      style={
                        changed.has(`${prefix}.${i}.${slot.toString()}`)
                          ? cellChangedStyle
                          : slot < used
                            ? cellStyle
                            : cellUnusedStyle
                      }
                      title={`bucketSets[${level.toString()}][${i}].nodes[${slot.toString()}]`}
                    >
                      <span style={cellIndexStyle}>{slot.toString()}</span>
                      {v === undefinedText ? '—' : v}
                    </span>
                  ))
                )}
              </span>
              <span
                style={
                  changed.has(`${prefix}.length.${i}`)
                    ? valueChangedStyle
                    : valueStyle
                }
                title={`bucketSets[${level.toString()}][${i}].length`}
              >
                {`length ${used.toString()}`}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
});

TraceBucketSet.displayName = 'TraceBucketSet';

const cellsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.2rem',
  marginTop: 0,
} as const;

const cellStyle: React.CSSProperties = {
  position: 'relative',
  minWidth: '2.2rem',
  padding: '0.45rem 0.2rem 0',
  border: `1px solid ${colors.edge}`,
  borderRadius: '3px',
  textAlign: 'center',
  marginTop: 0,
  transition: 'background 300ms ease',
} as const;

const cellChangedStyle: React.CSSProperties = {
  ...cellStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

const cellUnusedStyle: React.CSSProperties = {
  ...cellStyle,
  borderStyle: 'dashed',
  opacity: 0.45,
} as const;

const bucketSetStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  marginTop: '0.2rem',
} as const;

const bucketRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: 0,
  paddingLeft: '0.75rem',
} as const;

const cellIndexStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-0.1rem',
  left: '0.2rem',
  fontSize: '0.6rem',
  color: colors.muted,
} as const;
