import styled from '@emotion/styled';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr, Num, type Uint8 } from 'ts-data-forge';
import { type DeepReadonly, type Percent } from 'ts-type-forge';
import { blackHsl, contrastRatioHsl, whiteHsl } from 'ts-utils-additional';
import { huesDefault } from '../../constants/index.mjs';
import { toHue } from '../../functions/index.mjs';

const indices = [0, 1, 2] as const;

const saturationList = [80, 80, 100] as const satisfies readonly Percent[];

const lightnessList = [40, 60, 80] as const satisfies readonly Percent[];

const saturationListWithIndex = Arr.zip(saturationList, indices);

const lightnessListWithIndex = Arr.zip(lightnessList, indices);

// Written out rather than nested `Arr.zip`s: `Arr.zip`'s `const` type
// parameters reconstruct the tuple shape, and nesting them makes `tsc` give up
// with TS2589/TS2590.
const SL = [
  [[saturationList[0], lightnessList[0]], indices[0]],
  [[saturationList[1], lightnessList[1]], indices[1]],
  [[saturationList[2], lightnessList[2]], indices[2]],
] as const satisfies DeepReadonly<[[Percent, Percent], Uint8][]>;

const hslWithStyle = huesDefault.map((h, idx) => {
  // `huesDefault` is `NonEmptyArray<number>`; see the comment there for why it
  // is not the 360-member `Hue` tuple the original used.
  const hue = toHue(h);

  return {
    hue,
    idx,
    SLStyle: SL.map(([[saturation, lightness], key]) => {
      const contrastWhite = contrastRatioHsl(whiteHsl, [
        hue,
        saturation,
        lightness,
      ]);

      const contrastBlack = contrastRatioHsl(
        [hue, saturation, lightness],
        blackHsl,
      );

      return {
        key,
        contrastWhite,
        contrastBlack,
        hslStyle: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        whiteStyle: {
          backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          color: 'white',
        },
        blackStyle: {
          backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          color: 'black',
        },
        contrastWhiteDisplayValue: Num.roundAt(contrastWhite, 2),
        contrastBlackDisplayValue: Num.roundAt(contrastBlack, 2),
      };
    }),
  };
});

export const TextColorContrastTable = memoNamed(
  'TextColorContrastTable',
  () => (
    <Root>
      <PaperCustomized variant={'outlined'}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align={'center'}>{'Saturation（彩度）'}</TableCell>
              {saturationListWithIndex.map(([sat, i]) => (
                <React.Fragment key={i}>
                  <TableCell align={'center'}>{sat}</TableCell>
                  <TableCell align={'center'}>{sat}</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
            <TableRow>
              <TableCell align={'center'}>{'Lightness（輝度）'}</TableCell>
              {lightnessListWithIndex.map(([lightness, i]) => (
                <React.Fragment key={i}>
                  <TableCell align={'center'}>{lightness}</TableCell>
                  <TableCell align={'center'}>{lightness}</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
            <TableRow>
              <TableCell align={'center'}>{'Hue（色相）'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hslWithStyle.map(({ hue, SLStyle, idx }) => (
              <TableRow key={hue}>
                <TableCell align={'center'}>{idx}</TableCell>
                {SLStyle.map(
                  ({
                    contrastWhite,
                    contrastWhiteDisplayValue,
                    contrastBlack,
                    contrastBlackDisplayValue,
                    whiteStyle,
                    blackStyle,
                    hslStyle,
                    key,
                  }) => (
                    <React.Fragment key={key}>
                      <TableCell align={'left'} style={whiteStyle}>
                        <label>
                          <input
                            defaultChecked={contrastWhite > contrastBlack}
                            name={hslStyle}
                            type={'checkbox'}
                          />
                          {contrastWhiteDisplayValue}
                        </label>
                      </TableCell>
                      <TableCell align={'left'} style={blackStyle}>
                        <label>
                          <input
                            defaultChecked={contrastWhite <= contrastBlack}
                            name={hslStyle}
                            type={'checkbox'}
                          />
                          {contrastBlackDisplayValue}
                        </label>
                      </TableCell>
                    </React.Fragment>
                  ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PaperCustomized>
    </Root>
  ),
);

const PaperCustomized = styled(Paper)`
  margin-top: 10px;
  padding: 10px;
`;

const Root = styled.div`
  width: 100%;
  height: 100%;
  background-color: #c2c2c2;
  padding: 10px;
`;
