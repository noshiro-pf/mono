import XLSX from 'xlsx';

const workbook = XLSX.readFile('/home/noshiro/収支シミュレーター.xlsx');

const sheetName = workbook.SheetNames.find((name) =>
  name.includes('協会けんぽ'),
);

const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

console.log('Total rows:', data.length);

console.log('\nAll data:');

console.log(JSON.stringify(data, null, 2));
