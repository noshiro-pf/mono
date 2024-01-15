const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');
    cy.get(e('root')).should('be.visible');
  });

  it('config 1', () => {
    cy.get(e('numericInput-downPaymentManYen')).clear();
    cy.get(e('numericInput-downPaymentManYen')).type('200');

    cy.get(e('numericInput-propertyPriceManYen')).clear();
    cy.get(e('numericInput-propertyPriceManYen')).type('2780');

    cy.get(e('numericInput-borrowingPeriodYear')).clear();
    cy.get(e('numericInput-borrowingPeriodYear')).type('35');

    cy.get(e('numericInput-interestRatePerYear')).clear();
    cy.get(e('numericInput-interestRatePerYear')).type('0.5');

    cy.get(e('repaymentTypeRadioGroup')).within(() => {
      // eslint-disable-next-line cypress/no-force
      cy.get(e('radio--principal-equal-payment')).check({
        force: true,
      });
    });

    cy.get(e('borrowingTotalYenTitle')).should(
      'have.text',
      '借入金額（＝物件の金額－頭金）',
    );
    cy.get(e('borrowingTotalYenDescription')).should('have.text', '2580万円');

    cy.get(e('fixedPrincipalYenPerMonthTitle')).should(
      'have.text',
      '月々の元金の支払い額',
    );
    cy.get(e('fixedPrincipalYenPerMonthDescription')).should(
      'have.text',
      '61429円',
    );

    cy.get(e('interestSumTitle')).should('have.text', '利息合計額');
    cy.get(e('interestSumDescription')).should('have.text', '2262.88万円');

    cy.get(e('paymentsSumTitle')).should(
      'have.text',
      '合計支払い額（＝頭金＋借入金額＋利息）',
    );
    cy.get(e('paymentsSumDescription')).should('have.text', '5042.88万円');
  });

  it('config 2', () => {
    cy.get(e('numericInput-downPaymentManYen')).clear();
    cy.get(e('numericInput-downPaymentManYen')).type('0');

    cy.get(e('numericInput-propertyPriceManYen')).clear();
    cy.get(e('numericInput-propertyPriceManYen')).type('2780');

    cy.get(e('numericInput-borrowingPeriodYear')).clear();
    cy.get(e('numericInput-borrowingPeriodYear')).type('35');

    cy.get(e('numericInput-interestRatePerYear')).clear();
    cy.get(e('numericInput-interestRatePerYear')).type('0.5');

    cy.get(e('repaymentTypeRadioGroup')).within(() => {
      // eslint-disable-next-line cypress/no-force
      cy.get(e('radio--principal-and-interest-equal-repayment')).check({
        force: true,
      });
    });

    cy.get(e('borrowingTotalYenTitle')).should(
      'have.text',
      '借入金額（＝物件の金額－頭金）',
    );
    cy.get(e('borrowingTotalYenDescription')).should('have.text', '2780万円');

    cy.get(e('fixedMonthlyPaymentsYenTitle')).should(
      'have.text',
      '月々の支払い額',
    );
    cy.get(e('fixedMonthlyPaymentsYenDescription')).should(
      'have.text',
      '140303円',
    );

    cy.get(e('interestSumTitle')).should('have.text', '利息合計額');
    cy.get(e('interestSumDescription')).should('have.text', '3112.73万円');

    cy.get(e('paymentsSumTitle')).should(
      'have.text',
      '合計支払い額（＝頭金＋借入金額＋利息）',
    );
    cy.get(e('paymentsSumDescription')).should('have.text', '5892.73万円');
  });
});

export {};
