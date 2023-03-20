import failOnConsoleError from 'cypress-fail-on-console-error';

failOnConsoleError();

const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');
    cy.get(e('root')).should('be.visible');
  });

  it('tab 1', () => {
    cy.get(e('tabs')).within(() => {
      cy.get(e('tab-0')).click();
    });

    cy.get(e('root')).within(() => {
      cy.get('h1').eq(0).should('have.text', 'Links');
      cy.get('h1').eq(1).should('have.text', '略歴');
    });
  });

  it('tab 2', () => {
    cy.get(e('tabs')).within(() => {
      cy.get(e('tab-1')).click();
    });

    cy.get(e('root')).within(() => {
      cy.get('h1').should('have.text', '自己紹介');
    });
  });

  it('tab 3', () => {
    cy.get(e('tabs')).within(() => {
      cy.get(e('tab-2')).click();
    });

    cy.get(e('root')).within(() => {
      cy.get('h1').should('have.text', 'スキル');
    });
  });

  it('tab 4', () => {
    cy.get(e('tabs')).within(() => {
      cy.get(e('tab-3')).click();
    });

    cy.get(e('root')).within(() => {
      cy.get('h1').should('have.text', '制作物');
    });
  });

  it('tab 5', () => {
    cy.get(e('tabs')).within(() => {
      cy.get(e('tab-4')).click();
    });

    cy.get(e('root')).within(() => {
      cy.get('h1').should('have.text', '執筆物');
    });
  });
});
