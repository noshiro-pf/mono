import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  blackHsl,
  contrastRatioHsl,
  whiteHsl,
} from '@noshiro/ts-utils-additional';
import { Fragment } from 'react';
import { huesDefault } from '../../constants';

const indices = [0, 1, 2] as const;
const saturationList = [80, 80, 100] as const satisfies readonly Percent[];
const lightnessList = [40, 60, 80] as const satisfies readonly Percent[];

const saturationListWithIndex = Arr.zip(saturationList, indices);
const lightnessListWithIndex = Arr.zip(lightnessList, indices);

const SL = Arr.zip(
  Arr.zip(saturationList, lightnessList),
  indices,
) satisfies DeepReadonly<[[Percent, Percent], Uint8][]>;

const hslWithStyle = huesDefault.map((hue, idx) => ({
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
}));

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
                <Fragment key={i}>
                  <TableCell align={'center'}>{sat}</TableCell>
                  <TableCell align={'center'}>{sat}</TableCell>
                </Fragment>
              ))}
            </TableRow>
            <TableRow>
              <TableCell align={'center'}>{'Lightness（輝度）'}</TableCell>
              {lightnessListWithIndex.map(([lightness, i]) => (
                <Fragment key={i}>
                  <TableCell align={'center'}>{lightness}</TableCell>
                  <TableCell align={'center'}>{lightness}</TableCell>
                </Fragment>
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
                    <Fragment key={key}>
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
                    </Fragment>
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
