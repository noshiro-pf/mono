export const getImageElementFromUrl = (
  url: string
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const mut_img: Writable<HTMLImageElement> = new Image();

    mut_img.addEventListener('load', () => {
      resolve(mut_img);
    });
    mut_img.addEventListener('error', reject);
    mut_img.src = url;
  });
