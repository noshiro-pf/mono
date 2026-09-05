import html2canvas from 'html2canvas';
import { Optional } from 'ts-data-forge';
import { hand2String } from '../functions/index.mjs';
import { handSorted$, revealedBlocks$ } from '../store/index.mjs';
import { downloadFile } from '../utils/index.mjs';

// 牌姿をダウンロードする。
export const downloadProblemAsImage = async (): Promise<void> => {
  const target = document.querySelector<HTMLDivElement>('#problem');

  if (target === null) return;

  const config = { useCORS: true } as const;

  const canvas = await html2canvas(target, config);

  const src = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');

  const handSorted = handSorted$.getSnapshot();

  const revealedBlocks = revealedBlocks$.getSnapshot();

  if (Optional.isNone(handSorted) || Optional.isNone(revealedBlocks)) return;

  downloadFile(
    src,
    `${hand2String(handSorted.value, revealedBlocks.value)}.png`,
  );
};
