const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const filenameWithoutExt = 'test';

const createEmptyPdf = async () => {
  const pdfDoc = await PDFDocument.create();

  const pdfBytes = await pdfDoc.save();
  console.log(pdfDoc.getPageCount(), pdfDoc.getPageIndices());
  fs.writeFileSync('empty.pdf', pdfBytes);

  const emptyPdfBytes = fs.readFileSync('empty.pdf');
  const emptyPdfDoc = await PDFDocument.load(emptyPdfBytes);
  console.log(emptyPdfDoc.getPageCount(), emptyPdfDoc.getPageIndices());
};

const main = async () => {
  const srcPdfBytes = fs.readFileSync(`${filenameWithoutExt}.pdf`);
  const srcPdfDoc = await PDFDocument.load(srcPdfBytes);

  for (const pageIndex of srcPdfDoc.getPageIndices()) {
    const destPdfDoc = await PDFDocument.create();
    const [page] = await destPdfDoc.copyPages(srcPdfDoc, [pageIndex]);

    destPdfDoc.addPage(page);
    const destPdfBytes = await destPdfDoc.save();
    fs.writeFileSync(`${filenameWithoutExt}-${pageIndex}.pdf`, destPdfBytes);
  }
};

createEmptyPdf();
// main();
