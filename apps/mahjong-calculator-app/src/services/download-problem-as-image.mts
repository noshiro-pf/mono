import html2canvas from 'html2canvas';
import { hand2String } from '../functions/index.mjs';
import { calculatorStore } from '../store/index.mjs';
import { downloadFile } from '../utils/index.mjs';

// 牌姿をダウンロードする。
export const downloadProblemAsImage = async (): Promise<void> => {
  const target = document.querySelector<HTMLDivElement>('#problem');

  if (target === null) {
    return;
  }

  const config = { useCORS: true } as const;

  const canvas = await html2canvas(target, config);

  const src = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');

  const handSorted = calculatorStore.handSorted.getSnapshot().value;

  const revealedBlocks = calculatorStore.revealedBlocks.getSnapshot().value;

  downloadFile(src, `${hand2String(handSorted, revealedBlocks)}.png`);
};
