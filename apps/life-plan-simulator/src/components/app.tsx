import { constant, type JSX } from 'synstate-dom';
import { HousingLoanSection } from './housing-loan-section.js';

export const App = (): JSX.Element => (
  <main>
    <h1>{constant('ライフプランシミュレーター')}</h1>
    <HousingLoanSection />
  </main>
);
