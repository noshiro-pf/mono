import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import type { Hue, Percent, uint32 } from '@noshiro/ts-utils';
import {
  blackHsl,
  contrastRatioHsl,
  range,
  roundAt,
  whiteHsl,
  zip,
} from '@noshiro/ts-utils';
import { Fragment } from 'react';
import styled from 'styled-components';

const Root = styled.div`
  width: 100%;
  height: 100%;
  background-color: #c2c2c2;
  padding: 10px;
`;

const PaperCustomized = styled(Paper)`
  margin-top: 10px;
  padding: 10px;
`;

const hues: readonly Hue[] = range(0 as uint32, 360 as uint32) as Hue[];

const saturationList: readonly Percent[] = [80, 80, 100] as const;
const lightnessList: readonly Percent[] = [40, 60, 80] as const;

const SL: readonly (readonly [Percent, Percent])[] = zip(
  saturationList,
  lightnessList
);

const componentElement = (
  <Root>
    <PaperCustomized variant='outlined'>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>{'Saturation（彩度）'}</TableCell>
            {SL.map(([sat], i) => (
              <Fragment key={i}>
                <TableCell align='center'>{sat}</TableCell>
                <TableCell align='center'>{sat}</TableCell>
              </Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableCell align='center'>{'Lightness（輝度）'}</TableCell>
            {SL.map(([_, light], i) => (
              <Fragment key={i}>
                <TableCell align='center'>{light}</TableCell>
                <TableCell align='center'>{light}</TableCell>
              </Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableCell align='center'>{'Hue（色相）'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hues.map((hue, idx) => (
            <TableRow key={idx}>
              <TableCell align='center'>{idx}</TableCell>
              {SL.map(([saturation, lightness], i) => {
                const contrastWhite = contrastRatioHsl(whiteHsl, [
                  hue,
                  saturation,
                  lightness,
                ]);
                const contrastBlack = contrastRatioHsl(
                  [hue, saturation, lightness],
                  blackHsl
                );

                const hslStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                return (
                  <Fragment key={i}>
                    <TableCell
                      align='left'
                      style={{ backgroundColor: hslStyle, color: 'white' }}
                    >
                      <label>
                        <input
                          type='checkbox'
                          defaultChecked={contrastWhite > contrastBlack}
                          name={hslStyle}
                        />
                        {roundAt(contrastWhite, 2)}
                      </label>
                    </TableCell>
                    <TableCell
                      align='left'
                      style={{ backgroundColor: hslStyle, color: 'black' }}
                    >
                      <label>
                        <input
                          type='checkbox'
                          defaultChecked={contrastWhite <= contrastBlack}
                          name={hslStyle}
                        />
                        {roundAt(contrastBlack, 2)}
                      </label>
                    </TableCell>
                  </Fragment>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PaperCustomized>
  </Root>
);

export const TextColorContrastTable = memoNamed(
  'TextColorContrastTable',
  () => componentElement
);
