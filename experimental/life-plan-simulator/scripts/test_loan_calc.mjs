// 元利均等返済の計算式
const calculateFixedMonthlyPayment = (
  principal,
  monthlyRate,
  numberOfPayments,
) => {
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const r = monthlyRate;

  const n = numberOfPayments;

  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
};

const principal = 75_000_000;

const rate = 0.007;

const payments = 480;

const monthlyPayment = calculateFixedMonthlyPayment(principal, rate, payments);

console.log('Monthly payment:', monthlyPayment);

console.log('Expected:', 179189.774);

// 1ヶ月目の計算
const interest1 = principal * rate;

const principalPayment1 = monthlyPayment - interest1;

const balance1 = principal - principalPayment1;

console.log('\n1ヶ月目:');

console.log('利息:', interest1);

console.log('元金返済:', principalPayment1);

console.log('残高:', balance1);

console.log('Expected balance:', 74864560.23);
