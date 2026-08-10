import { type TileName } from './enum';

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
