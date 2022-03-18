export const downloadFile = (uri: string, filename: string = 'file'): void => {
  const mut_linkElement = document.createElement('a');
  mut_linkElement.download = filename;
  mut_linkElement.href = uri;
  mut_linkElement.click();
};
