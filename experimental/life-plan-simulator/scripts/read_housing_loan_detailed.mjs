import XLSX from 'xlsx';

const workbook = XLSX.readFile('./assets/収支シミュレーター.xlsx');

const sheetName = '住宅ローン';

const worksheet = workbook.Sheets[sheetName];

// Get the range
const range = XLSX.utils.decode_range(worksheet['!ref']);

console.log('Range:', worksheet['!ref']);

// Read specific cells to understand the formulas
console.log('\nCell F2 (適用金利 for month 1):', worksheet['F2']);

console.log('Cell G2 (返済額 for month 1):', worksheet['G2']);

console.log('Cell H2 (残高 initial):', worksheet['H2']);

console.log('Cell H3 (残高 after month 1):', worksheet['H3']);

console.log('\nCell F3:', worksheet['F3']);

console.log('Cell G3:', worksheet['G3']);

// Check if we can see formulas
console.log('\nLooking for formulas...');

console.log('G2 value:', worksheet['G2']?.v);

console.log('G2 formula:', worksheet['G2']?.f);

console.log('H3 formula:', worksheet['H3']?.f);
