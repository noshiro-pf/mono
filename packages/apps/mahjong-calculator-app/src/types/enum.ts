import * as t from '@noshiro/io-ts';

export type Bakaze = 'Nan' | 'Ton';

export type Jikaze = 'Nan' | 'Pei' | 'Sha' | 'Ton';

export type TehaiType = 'Chi-toi' | 'Kokushi' | 'normal';

export type MaximizeTarget = 'exp' | 'winProb';

export type Shanten = UintRange<0, 14> | -1;

export type Turn = UintRange<1, 18>;

export type DoraIndicatorPosition = UintRange<0, 5>;

export type NumTiles = UintRange<0, 5>;

const TileName = t.enumType([
  'Manzu1',
  'Manzu2',
  'Manzu3',
  'Manzu4',
  'Manzu5',
  'Manzu6',
  'Manzu7',
  'Manzu8',
  'Manzu9',
  'Pinzu1',
  'Pinzu2',
  'Pinzu3',
  'Pinzu4',
  'Pinzu5',
  'Pinzu6',
  'Pinzu7',
  'Pinzu8',
  'Pinzu9',
  'Sozu1',
  'Sozu2',
  'Sozu3',
  'Sozu4',
  'Sozu5',
  'Sozu6',
  'Sozu7',
  'Sozu8',
  'Sozu9',
  'Ton',
  'Nan',
  'Sha',
  'Pei',
  'Haku',
  'Hatsu',
  'Chun',
  'AkaManzu5',
  'AkaPinzu5',
  'AkaSozu5',
]);

export type TileName = t.TypeOf<typeof TileName>;

export const castToTileName = TileName.cast as (a: string) => TileName;

export type RevealedBlockType = 'Ankan' | 'Chi-' | 'Kakan' | 'Minkan' | 'Pon';

export type RevealedBlock =
  | 'Ankantsu-Manzu1'
  | 'Ankantsu-Manzu2'
  | 'Ankantsu-Manzu3'
  | 'Ankantsu-Manzu4'
  | 'Ankantsu-Manzu5'
  | 'Ankantsu-Manzu5-withAka'
  | 'Ankantsu-Manzu6'
  | 'Ankantsu-Manzu7'
  | 'Ankantsu-Manzu8'
  | 'Ankantsu-Manzu9'
  | 'Ankantsu-Pinzu1'
  | 'Ankantsu-Pinzu2'
  | 'Ankantsu-Pinzu3'
  | 'Ankantsu-Pinzu4'
  | 'Ankantsu-Pinzu5'
  | 'Ankantsu-Pinzu5-withAka'
  | 'Ankantsu-Pinzu6'
  | 'Ankantsu-Pinzu7'
  | 'Ankantsu-Pinzu8'
  | 'Ankantsu-Pinzu9'
  | 'Ankantsu-Sozu1'
  | 'Ankantsu-Sozu2'
  | 'Ankantsu-Sozu3'
  | 'Ankantsu-Sozu4'
  | 'Ankantsu-Sozu5'
  | 'Ankantsu-Sozu5-withAka'
  | 'Ankantsu-Sozu6'
  | 'Ankantsu-Sozu7'
  | 'Ankantsu-Sozu8'
  | 'Ankantsu-Sozu9'
  | 'Ankantsu-Ton'
  | 'Ankantsu-Nan'
  | 'Ankantsu-Sha'
  | 'Ankantsu-Pei'
  | 'Ankantsu-Haku'
  | 'Ankantsu-Hatsu'
  | 'Ankantsu-Chun'
  | 'Minkantsu-Manzu1'
  | 'Minkantsu-Manzu2'
  | 'Minkantsu-Manzu3'
  | 'Minkantsu-Manzu4'
  | 'Minkantsu-Manzu5'
  | 'Minkantsu-Manzu5-withAka'
  | 'Minkantsu-Manzu6'
  | 'Minkantsu-Manzu7'
  | 'Minkantsu-Manzu8'
  | 'Minkantsu-Manzu9'
  | 'Minkantsu-Pinzu1'
  | 'Minkantsu-Pinzu2'
  | 'Minkantsu-Pinzu3'
  | 'Minkantsu-Pinzu4'
  | 'Minkantsu-Pinzu5'
  | 'Minkantsu-Pinzu5-withAka'
  | 'Minkantsu-Pinzu6'
  | 'Minkantsu-Pinzu7'
  | 'Minkantsu-Pinzu8'
  | 'Minkantsu-Pinzu9'
  | 'Minkantsu-Sozu1'
  | 'Minkantsu-Sozu2'
  | 'Minkantsu-Sozu3'
  | 'Minkantsu-Sozu4'
  | 'Minkantsu-Sozu5'
  | 'Minkantsu-Sozu5-withAka'
  | 'Minkantsu-Sozu6'
  | 'Minkantsu-Sozu7'
  | 'Minkantsu-Sozu8'
  | 'Minkantsu-Sozu9'
  | 'Minkantsu-Ton'
  | 'Minkantsu-Nan'
  | 'Minkantsu-Sha'
  | 'Minkantsu-Pei'
  | 'Minkantsu-Haku'
  | 'Minkantsu-Hatsu'
  | 'Minkantsu-Chun'
  | 'Kotsu-Manzu1'
  | 'Kotsu-Manzu2'
  | 'Kotsu-Manzu3'
  | 'Kotsu-Manzu4'
  | 'Kotsu-Manzu5'
  | 'Kotsu-Manzu5-withAka'
  | 'Kotsu-Manzu6'
  | 'Kotsu-Manzu7'
  | 'Kotsu-Manzu8'
  | 'Kotsu-Manzu9'
  | 'Kotsu-Pinzu1'
  | 'Kotsu-Pinzu2'
  | 'Kotsu-Pinzu3'
  | 'Kotsu-Pinzu4'
  | 'Kotsu-Pinzu5'
  | 'Kotsu-Pinzu5-withAka'
  | 'Kotsu-Pinzu6'
  | 'Kotsu-Pinzu7'
  | 'Kotsu-Pinzu8'
  | 'Kotsu-Pinzu9'
  | 'Kotsu-Sozu1'
  | 'Kotsu-Sozu2'
  | 'Kotsu-Sozu3'
  | 'Kotsu-Sozu4'
  | 'Kotsu-Sozu5'
  | 'Kotsu-Sozu5-withAka'
  | 'Kotsu-Sozu6'
  | 'Kotsu-Sozu7'
  | 'Kotsu-Sozu8'
  | 'Kotsu-Sozu9'
  | 'Kotsu-Ton'
  | 'Kotsu-Nan'
  | 'Kotsu-Sha'
  | 'Kotsu-Pei'
  | 'Kotsu-Haku'
  | 'Kotsu-Hatsu'
  | 'Kotsu-Chun'
  | 'Manzu123'
  | 'Manzu234'
  | 'Manzu345'
  | 'Manzu345-withAka'
  | 'Manzu456'
  | 'Manzu456-withAka'
  | 'Manzu567'
  | 'Manzu567-withAka'
  | 'Manzu678'
  | 'Manzu789'
  | 'Pinzu123'
  | 'Pinzu234'
  | 'Pinzu345'
  | 'Pinzu345-withAka'
  | 'Pinzu456'
  | 'Pinzu456-withAka'
  | 'Pinzu567'
  | 'Pinzu567-withAka'
  | 'Pinzu678'
  | 'Pinzu789'
  | 'Sozu123'
  | 'Sozu234'
  | 'Sozu345'
  | 'Sozu345-withAka'
  | 'Sozu456'
  | 'Sozu456-withAka'
  | 'Sozu567'
  | 'Sozu567-withAka'
  | 'Sozu678'
  | 'Sozu789';
