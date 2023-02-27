const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('hello', () => {
  it('hello', () => {
    cy.visit('/');

    const incrementButtonId = 'increment-button';

    cy.get(e(incrementButtonId)).click();
    cy.get(e(incrementButtonId)).should('have.text', 'count is 1');
  });
});

export {};
