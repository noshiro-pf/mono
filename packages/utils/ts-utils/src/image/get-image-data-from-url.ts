export const getImageElementFromUrl = (
  url: string
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const mut_img = new Image();
    mut_img.onload = () => {
      resolve(mut_img);
    };
    mut_img.onerror = reject;
    mut_img.src = url;
  });
