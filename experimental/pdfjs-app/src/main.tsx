import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import { getDocument } from 'pdfjs-dist';
import type { MutableRef } from 'preact/hooks';
import { useCallback, useRef } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';

// https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input

const onFileInputChange = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  ev: JSXInternal.TargetedEvent<HTMLInputElement, Event>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  canvasRef: MutableRef<HTMLCanvasElement | null>,
): void => {
  const files = (ev.target as { files: FileList } | null)?.files;

  if (files === undefined) return undefined;

  const file = files[0];
  if (file === undefined) return undefined;

  if (file.type !== 'application/pdf') {
    console.error(file.name, 'is not a pdf file.');
    return;
  }

  const fileReader = new FileReader();

  // eslint-disable-next-line functional/immutable-data,func-names,unicorn/prefer-add-event-listener
  (fileReader as Writable<typeof fileReader>).onload = function () {
    const result = this.result;
    console.log({ result });
    if (isNull(result) || isString(result)) return;

    const typedarray = new Uint8Array(result);

    console.log({ typedarray });

    getDocument(typedarray)
      // eslint-disable-next-line func-names, prefer-arrow-callback
      .promise.then(function (pdf) {
        // you can now use *pdf* here
        console.log('the pdf has ', pdf.numPages, 'page(s).');
        return pdf.getPage(pdf.numPages);
      })
      .then((page) => {
        console.log({ page });
        // you can now use *page* here
        const viewport = page.getViewport();
        // const canvas = document.querySelector('canvas');
        const canvas = canvasRef.current;
        if (canvas !== null) {
          canvas.setAttribute('height', viewport.height.toString());
          canvas.setAttribute('width', viewport.width.toString());
          const canvasContext = canvas.getContext('2d');
          if (canvasContext !== null) {
            page.render({ canvasContext, viewport });
          }
        }
      })
      .catch(console.error);
  };

  fileReader.readAsArrayBuffer(file);

  /*
  // eslint-disable-next-line unicorn/no-for-loop,@typescript-eslint/prefer-for-of,functional/no-let
  // for (let i = 0; i < files.length; i += 1) {
  //   const file = files[i];
  // if (file === undefined) continue;

  // const fileReader = new FileReader();

  // fileReader.addEventListener('load', function onLoad() {
  //   // eslint-disable-next-line @typescript-eslint/no-invalid-this
  //   const result = this.result;
  //   // Step 4:turn array buffer into typed array
  //   if (isNull(result) || isString(result)) return;

  //   const typedarray = new Uint8Array(result);

  //   // Step 5:pdfjs should be able to read this
  //   const loadingTask = getDocument(typedarray);
  //   loadingTask.promise.then(console.log).catch(console.error);
  // });
  // // eslint-disable-next-line no-await-in-loop
  // // await file
  // //   .stream()
  // //   .getReader()
  // //   .read()
  // //   .then((res) => {
  // //     if (res.value !== undefined) {
  // //       console.log({
  // //         document: getDocument(res.value),
  // //         done: res.done,
  // //         file,
  // //       });
  // //     }
  // //   });
  // // }

  // fileReader.readAsArrayBuffer(file);
  */
};

export const Main = memoNamed('Main', () => {
  const canvasRef: MutableRef<HTMLCanvasElement | null> = useRef(null);

  const handler: JSXInternal.GenericEventHandler<HTMLInputElement> =
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useCallback((ev) => {
      onFileInputChange(ev, canvasRef);
    }, []);

  return (
    <Root>
      <input accept='application/pdf' multiple type='file' onChange={handler} />
      <canvas ref={canvasRef} />
    </Root>
  );
});

const Root = styled('div')`
  min-height: 100vh;
`;
