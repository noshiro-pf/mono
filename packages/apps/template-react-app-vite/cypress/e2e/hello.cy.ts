const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('hello', () => {
  it('hello', () => {
    cy.visit('/');

    const incrementButton = cy.get(e('increment-button'));

    incrementButton.click();
    incrementButton.should('have.text', 'count is 1');
  });
});

export {};
