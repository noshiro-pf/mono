import failOnConsoleError from 'cypress-fail-on-console-error';

failOnConsoleError();

const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');
    cy.get(e('root')).should('be.visible');
  });
});