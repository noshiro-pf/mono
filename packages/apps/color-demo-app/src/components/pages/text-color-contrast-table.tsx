import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import {
  blackHsl,
  contrastRatioHsl,
  whiteHsl,
  type Hue,
  type Percent,
} from '@noshiro/ts-utils-additional';
import { Fragment } from 'react';
import styled from 'styled-components';

const hues: readonly Hue[] = Arr.seqUnwrapped(360);

const indices = [0, 1, 2] as const;
const saturationList = [80, 80, 100] as const;
const lightnessList = [40, 60, 80] as const;

const saturationListWithIndex = Arr.zip(saturationList, indices);
const lightnessListWithIndex = Arr.zip(lightnessList, indices);

assertType<TypeExtends<typeof saturationList, readonly Percent[]>>();
assertType<TypeExtends<typeof lightnessList, readonly Percent[]>>();

const SL = Arr.zip(Arr.zip(saturationList, lightnessList), indices);

assertType<
  TypeExtends<typeof SL, DeepReadonly<[[Percent, Percent], number][]>>
>();

export const TextColorContrastTable = memoNamed(
  'TextColorContrastTable',
  () => componentElement
);

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

const componentElement = (
  <Root>
    <PaperCustomized variant='outlined'>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>{'Saturation（彩度）'}</TableCell>
            {saturationListWithIndex.map(([sat, i]) => (
              <Fragment key={i}>
                <TableCell align='center'>{sat}</TableCell>
                <TableCell align='center'>{sat}</TableCell>
              </Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableCell align='center'>{'Lightness（輝度）'}</TableCell>
            {lightnessListWithIndex.map(([lightness, i]) => (
              <Fragment key={i}>
                <TableCell align='center'>{lightness}</TableCell>
                <TableCell align='center'>{lightness}</TableCell>
              </Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableCell align='center'>{'Hue（色相）'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hues.map((hue, idx) => (
            <TableRow key={hue}>
              <TableCell align='center'>{idx}</TableCell>
              {SL.map(([[saturation, lightness], key]) => {
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
                  <Fragment key={key}>
                    <TableCell
                      align='left'
                      style={{ backgroundColor: hslStyle, color: 'white' }}
                    >
                      <label>
                        <input
                          defaultChecked={contrastWhite > contrastBlack}
                          name={hslStyle}
                          type='checkbox'
                        />
                        {Num.roundAt(contrastWhite, 2)}
                      </label>
                    </TableCell>
                    <TableCell
                      align='left'
                      style={{ backgroundColor: hslStyle, color: 'black' }}
                    >
                      <label>
                        <input
                          defaultChecked={contrastWhite <= contrastBlack}
                          name={hslStyle}
                          type='checkbox'
                        />
                        {Num.roundAt(contrastBlack, 2)}
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
