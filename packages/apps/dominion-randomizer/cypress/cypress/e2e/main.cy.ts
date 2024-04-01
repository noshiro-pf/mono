const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', { testIsolation: false }, () => {
  const incrementButtonId = 'increment-button';

  it('visit', () => {
    cy.visit('/');
    cy.get(e(incrementButtonId)).should('be.visible');
  });

  it('hello', () => {
    cy.get(e(incrementButtonId)).click();
    cy.get(e(incrementButtonId)).should('have.text', 'count is 1');
  });
});

export {};
