import fs from 'node:fs';
import XLSX from 'xlsx';

const workbook = XLSX.readFile('/home/noshiro/収支シミュレーター.xlsx');

const sheetName = workbook.SheetNames.find((name) =>
  name.includes('協会けんぽ'),
);

const worksheet = workbook.Sheets[sheetName];

const rawData = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: null,
});

// Find header row (行12: 等級, 月額, ...)
const headerRowIndex = rawData.findIndex((row) => row[0] === '等級');

console.log('Header row index:', headerRowIndex);

console.log('Header:', rawData[headerRowIndex]);

console.log('Sub-header:', rawData[headerRowIndex + 1]);

// Extract data rows (starting from row 13)
const dataRows = rawData
  .slice(headerRowIndex + 2)
  .filter((row) => row[0] != null);

console.log('\nFirst 10 data rows:');

for (const [i, row] of dataRows.slice(0, 10).entries()) {
  console.log(`Row ${i}:`, JSON.stringify(row));
}

console.log('\nTotal data rows:', dataRows.length);

// Parse into structured data
const parsedData = dataRows.map((row) => {
  const grade = String(row[0] || '')
    .replace(/[(（].*[)）]/, '')
    .trim(); // Remove (1), (2), etc.

  return {
    grade,
    standardMonthlyRemuneration: row[1],
    remunerationRangeFrom: row[2],
    remunerationRangeTo: row[4],
    healthInsuranceNoLongTermCare: {
      total: row[5],
      half: row[6],
    },
    healthInsuranceWithLongTermCare: {
      total: row[7],
      half: row[8],
    },
    welfarePension: {
      total: row[9],
      half: row[10],
    },
  };
});

console.log('\nFirst 5 parsed entries:');

console.log(JSON.stringify(parsedData.slice(0, 5), null, 2));

// Save to file
const outputPath = './src/data/kyoukai-kenpo-insurance-premium-table.json';

fs.mkdirSync('./src/data', { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2));

console.log('\nSaved to:', outputPath);
