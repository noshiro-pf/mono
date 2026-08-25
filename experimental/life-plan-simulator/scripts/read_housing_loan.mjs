import XLSX from 'xlsx';

const workbook = XLSX.readFile('./assets/収支シミュレーター.xlsx');

const sheetName = workbook.SheetNames.find((name) =>
  name.includes('住宅ローン'),
);

console.log('Found sheet:', sheetName);

const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

console.log('\nTotal rows:', data.length);

console.log('\nFirst 50 rows:');

for (const [i, row] of data.slice(0, 50).entries()) {
  console.log(`Row ${i}:`, JSON.stringify(row));
}
