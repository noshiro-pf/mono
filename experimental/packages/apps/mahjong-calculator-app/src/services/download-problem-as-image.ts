import { downloadFile } from '@noshiro/ts-utils-additional';
import html2canvas from 'html2canvas';
import { hand2String } from '../functions';
import { handSorted$, revealedBlocks$ } from '../store';

// 牌姿をダウンロードする。
export const downloadProblemAsImage = async (): Promise<void> => {
  const target = document.querySelector<HTMLDivElement>('#problem');
  const config = { useCORS: true };

  if (target === null) return;

  const canvas = await html2canvas(target, config);

  const src = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');

  const handSorted = handSorted$.getSnapshot();
  const revealedBlocks = revealedBlocks$.getSnapshot();

  if (Maybe.isNone(handSorted) || Maybe.isNone(revealedBlocks)) return;

  downloadFile(
    src,
    `${hand2String(handSorted.value, revealedBlocks.value)}.png`,
  );
};
