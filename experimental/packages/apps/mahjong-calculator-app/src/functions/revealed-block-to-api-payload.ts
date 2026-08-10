import { revealedTileTypeDef, tileDef } from '../constants';
import { type ApiMeldedBlock, type RevealedBlock } from '../types';
import { revealedBlockToTiles } from './revealed-block-to-tiles';

export const revealedBlockToApiPayload = (
  revealedBlock: RevealedBlock,
): ApiMeldedBlock =>
  pipe(revealedBlock)
    .chain((a) => {
      switch (a) {
        case 'Ankantsu-Manzu1':
        case 'Ankantsu-Manzu2':
        case 'Ankantsu-Manzu3':
        case 'Ankantsu-Manzu4':
        case 'Ankantsu-Manzu5':
        case 'Ankantsu-Manzu5-withAka':
        case 'Ankantsu-Manzu6':
        case 'Ankantsu-Manzu7':
        case 'Ankantsu-Manzu8':
        case 'Ankantsu-Manzu9':
        case 'Ankantsu-Pinzu1':
        case 'Ankantsu-Pinzu2':
        case 'Ankantsu-Pinzu3':
        case 'Ankantsu-Pinzu4':
        case 'Ankantsu-Pinzu5':
        case 'Ankantsu-Pinzu5-withAka':
        case 'Ankantsu-Pinzu6':
        case 'Ankantsu-Pinzu7':
        case 'Ankantsu-Pinzu8':
        case 'Ankantsu-Pinzu9':
        case 'Ankantsu-Sozu1':
        case 'Ankantsu-Sozu2':
        case 'Ankantsu-Sozu3':
        case 'Ankantsu-Sozu4':
        case 'Ankantsu-Sozu5':
        case 'Ankantsu-Sozu5-withAka':
        case 'Ankantsu-Sozu6':
        case 'Ankantsu-Sozu7':
        case 'Ankantsu-Sozu8':
        case 'Ankantsu-Sozu9':
        case 'Ankantsu-Ton':
        case 'Ankantsu-Nan':
        case 'Ankantsu-Sha':
        case 'Ankantsu-Pei':
        case 'Ankantsu-Haku':
        case 'Ankantsu-Hatsu':
        case 'Ankantsu-Chun':
          return revealedTileTypeDef.Ankan.id;
        case 'Minkantsu-Manzu1':
        case 'Minkantsu-Manzu2':
        case 'Minkantsu-Manzu3':
        case 'Minkantsu-Manzu4':
        case 'Minkantsu-Manzu5':
        case 'Minkantsu-Manzu5-withAka':
        case 'Minkantsu-Manzu6':
        case 'Minkantsu-Manzu7':
        case 'Minkantsu-Manzu8':
        case 'Minkantsu-Manzu9':
        case 'Minkantsu-Pinzu1':
        case 'Minkantsu-Pinzu2':
        case 'Minkantsu-Pinzu3':
        case 'Minkantsu-Pinzu4':
        case 'Minkantsu-Pinzu5':
        case 'Minkantsu-Pinzu5-withAka':
        case 'Minkantsu-Pinzu6':
        case 'Minkantsu-Pinzu7':
        case 'Minkantsu-Pinzu8':
        case 'Minkantsu-Pinzu9':
        case 'Minkantsu-Sozu1':
        case 'Minkantsu-Sozu2':
        case 'Minkantsu-Sozu3':
        case 'Minkantsu-Sozu4':
        case 'Minkantsu-Sozu5':
        case 'Minkantsu-Sozu5-withAka':
        case 'Minkantsu-Sozu6':
        case 'Minkantsu-Sozu7':
        case 'Minkantsu-Sozu8':
        case 'Minkantsu-Sozu9':
        case 'Minkantsu-Ton':
        case 'Minkantsu-Nan':
        case 'Minkantsu-Sha':
        case 'Minkantsu-Pei':
        case 'Minkantsu-Haku':
        case 'Minkantsu-Hatsu':
        case 'Minkantsu-Chun':
          return revealedTileTypeDef.Minkan.id;
        case 'Kotsu-Manzu1':
        case 'Kotsu-Manzu2':
        case 'Kotsu-Manzu3':
        case 'Kotsu-Manzu4':
        case 'Kotsu-Manzu5':
        case 'Kotsu-Manzu5-withAka':
        case 'Kotsu-Manzu6':
        case 'Kotsu-Manzu7':
        case 'Kotsu-Manzu8':
        case 'Kotsu-Manzu9':
        case 'Kotsu-Pinzu1':
        case 'Kotsu-Pinzu2':
        case 'Kotsu-Pinzu3':
        case 'Kotsu-Pinzu4':
        case 'Kotsu-Pinzu5':
        case 'Kotsu-Pinzu5-withAka':
        case 'Kotsu-Pinzu6':
        case 'Kotsu-Pinzu7':
        case 'Kotsu-Pinzu8':
        case 'Kotsu-Pinzu9':
        case 'Kotsu-Sozu1':
        case 'Kotsu-Sozu2':
        case 'Kotsu-Sozu3':
        case 'Kotsu-Sozu4':
        case 'Kotsu-Sozu5':
        case 'Kotsu-Sozu5-withAka':
        case 'Kotsu-Sozu6':
        case 'Kotsu-Sozu7':
        case 'Kotsu-Sozu8':
        case 'Kotsu-Sozu9':
        case 'Kotsu-Ton':
        case 'Kotsu-Nan':
        case 'Kotsu-Sha':
        case 'Kotsu-Pei':
        case 'Kotsu-Haku':
        case 'Kotsu-Hatsu':
        case 'Kotsu-Chun':
          return revealedTileTypeDef.Pon.id;
        case 'Manzu123':
        case 'Manzu234':
        case 'Manzu345':
        case 'Manzu345-withAka':
        case 'Manzu456':
        case 'Manzu456-withAka':
        case 'Manzu567':
        case 'Manzu567-withAka':
        case 'Manzu678':
        case 'Manzu789':
        case 'Pinzu123':
        case 'Pinzu234':
        case 'Pinzu345':
        case 'Pinzu345-withAka':
        case 'Pinzu456':
        case 'Pinzu456-withAka':
        case 'Pinzu567':
        case 'Pinzu567-withAka':
        case 'Pinzu678':
        case 'Pinzu789':
        case 'Sozu123':
        case 'Sozu234':
        case 'Sozu345':
        case 'Sozu345-withAka':
        case 'Sozu456':
        case 'Sozu456-withAka':
        case 'Sozu567':
        case 'Sozu567-withAka':
        case 'Sozu678':
        case 'Sozu789':
          return revealedTileTypeDef['Chi-'].id;
      }
    })
    .chain((id) => {
      const tilesNo = Tpl.map(
        revealedBlockToTiles(revealedBlock),
        (t) => tileDef[t].no,
      );

      return {
        type: id,
        tiles: tilesNo,
        /* 1個目の牌を鳴いたことにする */
        discardedTile: tilesNo[0],
        /* 上家から鳴いたことにする */
        from: 3,
      } as const;
    }).value;
