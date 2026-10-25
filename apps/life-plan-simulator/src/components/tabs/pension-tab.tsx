import { constant, view, type JSX } from 'synstate-dom';
import { input$, result$, updateSection } from '../../store/index.mjs';
import { formatAmount, formatYen } from '../../utils/index.mjs';
import { NumberField, OutputField } from '../fields/index.mjs';

/** `年金受給額` シート: 受給額の計算と、受給開始年齢ごとの手取り・損益分岐。 */
export const PensionTab = (): JSX.Element => (
  <div class={constant('tab-body')}>
    <section>
      <h2>{constant('標準受給額（65 歳から受給する場合）')}</h2>
      <p class={constant('note')}>
        {constant(
          '老齢厚生年金（報酬比例部分）は 22 歳から退職年齢までの年収（年収の推移の表から）の平均 × 0.005481 × 加入年数。年収は 780 万円で頭打ちにする。',
        )}
      </p>
      <div class={constant('form')}>
        <NumberField
          label="基礎年金の加入月数"
          value={view(input$, (i) => i.pension.basicPensionMonths)}
          onChange={(basicPensionMonths) => {
            updateSection('pension', (p) => ({ ...p, basicPensionMonths }));
          }}
        />
        <OutputField
          label="厚生年金の加入年数"
          value={view(result$, (r) => `${r.pension.enrolledYears} 年`)}
        />
        <OutputField
          label="平均年収"
          value={view(result$, (r) => formatYen(r.pension.averageAnnualIncome))}
        />
        <OutputField
          label="老齢厚生年金（報酬比例部分）"
          value={view(result$, (r) => formatYen(r.pension.welfarePension))}
        />
        <OutputField
          label="老齢基礎年金"
          value={view(result$, (r) => formatYen(r.pension.basicPension))}
        />
        <OutputField
          label="年金合計（年額）"
          e2e="pension-annual"
          value={view(result$, (r) => formatYen(r.pension.annualAt65))}
        />
        <OutputField
          label="年金合計（月額）"
          value={view(result$, (r) => formatYen(r.pension.annualAt65 / 12))}
        />
      </div>
    </section>
    <section>
      <h2>{constant('受給開始年齢ごとの手取り')}</h2>
      <p class={constant('note')}>
        {constant(
          '「何歳まで得か」は、各年齢までの手取りの累計（老後の運用利回りで運用したとき）がほかの受給開始年齢より多い、最後の年齢。',
        )}
      </p>
      <div class={constant('table-wrapper')}>
        <table class={constant('result')} data-e2e={constant('pension-table')}>
          <caption>{constant('受給開始年齢ごとの年金（円 / 年）')}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th scope={constant('col')}>{constant(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 受給開始年齢は 60〜75 歳の 16 行で固定 */}
            {Array.from({ length: 16 }, (_, i) => (
              <tr
                class={{
                  selected: view(
                    input$,
                    (input) =>
                      Math.floor(input.assumptions.pensionStartAge) === 60 + i,
                  ),
                }}
              >
                <th scope={constant('row')}>{constant(`${60 + i} 歳`)}</th>
                {cells.map((cell) => (
                  <td>
                    {view(result$, (r) => {
                      const row = r.pension.byStartAge[i];

                      return row === undefined ? '' : cell(row);
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

const headers = [
  '受給開始年齢',
  '受給額',
  '公的年金等控除額',
  '社会保険料（概算）',
  '所得税',
  '住民税',
  '年間手取り額',
  '何歳まで得か',
] as const;

type Row = Readonly<{
  gross: number;
  deduction: number;
  socialInsurance: number;
  incomeTax: number;
  residentTax: number;
  net: number;
  lastAgeBest: number | undefined;
}>;

const cells: readonly ((row: Row) => string)[] = [
  (r) => formatAmount(r.gross),
  (r) => formatAmount(r.deduction),
  (r) => formatAmount(r.socialInsurance),
  (r) => formatAmount(r.incomeTax),
  (r) => formatAmount(r.residentTax),
  (r) => formatAmount(r.net),
  (r) =>
    r.lastAgeBest === undefined
      ? ('' as const)
      : (`${r.lastAgeBest} 歳` as const),
] as const;
