export const downloadFile = (uri: string, filename: string = 'file'): void => {
  const linkElement = document.createElement('a');
  linkElement.download = filename;
  linkElement.href = uri;
  linkElement.click();
};
