const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');
    cy.get(e('filter-input')).should('be.visible');
  });

  it('filter 4,5', () => {
    cy.get(e('filter-input')).clear();
    cy.get(e('filter-input')).type('4,5');

    cy.get(e('table-body')).within(() => {
      cy.get('tr')
        .eq(0)
        .within(() => {
          cy.get('td').eq(0).should('have.text', '4');
          cy.get('td').eq(1).should('have.text', '5');
          cy.get('td').eq(2).should('have.text', '7');
          cy.get('td').eq(4).should('have.text', '357');
          cy.get('td').eq(5).should('have.text', '742');
          cy.get('td').eq(6).should('have.text', '197');
          cy.get('td').eq(7).should('have.text', '7');
        });

      cy.get('tr')
        .eq(1)
        .within(() => {
          cy.get('td').eq(0).should('have.text', '4');
          cy.get('td').eq(1).should('have.text', '5');
          cy.get('td').eq(2).should('have.text', '8');
          cy.get('td').eq(4).should('have.text', '314');
          cy.get('td').eq(5).should('have.text', '782');
          cy.get('td').eq(6).should('have.text', '200');
          cy.get('td').eq(7).should('have.text', '7');
        });
    });
  });

  it('filter 12,2,3', () => {
    cy.get(e('filter-input')).clear();
    cy.get(e('filter-input')).type('12,2,3');

    cy.get(e('table-body')).within(() => {
      cy.get('tr')
        .eq(0)
        .within(() => {
          cy.get('td').eq(0).should('have.text', '2');
          cy.get('td').eq(1).should('have.text', '3');
          cy.get('td').eq(2).should('have.text', '12');
          cy.get('td').eq(4).should('have.text', '30');
          cy.get('td').eq(5).should('have.text', '538');
          cy.get('td').eq(6).should('have.text', '728');
          cy.get('td').eq(7).should('have.text', '0');
        });
    });
  });
});

export {};
