const e = (selector: string): string => `[data-cy="${selector}"]`;

const path = (selectorList: readonly string[]): string =>
  selectorList.map(e).join(' ');

describe('simple view check', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');

    cy.get(path(['title'])).should('be.visible');
  });

  it('show create event page', () => {
    // create-page
    cy.get(e('create-page')).within(() => {
      cy.get(path(['title'])).should('be.visible');
      cy.get(path(['note'])).should('be.visible');
      cy.get(path(['datetime-list', 'add-button'])).should('be.visible');
    });
  });
});

export {};
