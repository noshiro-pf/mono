/** Saves `text` as a file through an object URL and a clicked anchor. */
export const downloadJson = (fileName: string, text: string): void => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );

  const mut_anchor = document.createElement('a');

  mut_anchor.href = url;

  mut_anchor.download = fileName;

  mut_anchor.click();

  // The download the click starts reads the URL later; one never revoked keeps
  // its blob for the page's lifetime.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, revokeAfterMs);
};

const revokeAfterMs = 60_000;
