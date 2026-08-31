import { type UintRange } from 'ts-type-forge';
import { type TileName } from './enum.mjs';

export type Tile = Readonly<{
  id: TileName;
  no: UintRange<0, 38>;
  displayName: string;
  MPSString: string;
  TenhoMPSString: string;
  TsumoProbString: string;
  order: number;
  priority: number;
}>;
