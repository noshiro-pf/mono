const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('add', { testIsolation: false }, () => {
  it('visit', () => {
    cy.visit('/');
    cy.get(e('input-area')).should('be.visible');
  });

  it('4 + 5 = 9', () => {
    cy.get(e('input-area')).clear();
    cy.get(e('input-area')).type('((+ 4) 5)');

    cy.get(e('output-area')).should(
      'have.value',
      [
        '0.	((+ 4) 5)',
        '1.	((λn.(λs.(λz.((4 s) ((n s) z))))) 5)',
        '2.	(λs.(λz.((4 s) ((5 s) z))))',
        '3.	(λs.(λz.((λz.(s (s (s (s z))))) ((5 s) z))))',
        '4.	(λs.(λz.(s (s (s (s ((5 s) z)))))))',
        '5.	(λs.(λz.(s (s (s (s ((λz.(s (s (s (s (s z)))))) z)))))))',
        '6.	9',
      ].join('\n'),
    );
  });

  it('0 + 0 = 0', () => {
    cy.get(e('input-area')).clear();
    cy.get(e('input-area')).type('((+ 0) 0)');

    cy.get(e('output-area')).should(
      'have.value',
      [
        '0.	((+ 0) 0)',
        '1.	((λn.(λs.(λz.((0 s) ((n s) z))))) 0)',
        '2.	(λs.(λz.((0 s) ((0 s) z))))',
        '3.	(λs.(λz.((λz.z) ((0 s) z))))',
        '4.	(λs.(λz.((0 s) z)))',
        '5.	(λs.(λz.((λz.z) z)))',
        '6.	0',
      ].join('\n'),
    );
  });

  it('0 + 3 = 3', () => {
    cy.get(e('input-area')).clear();
    cy.get(e('input-area')).type('((+ 0) 3)');

    cy.get(e('output-area')).should(
      'have.value',
      [
        '0.	((+ 0) 3)',
        '1.	((λn.(λs.(λz.((0 s) ((n s) z))))) 3)',
        '2.	(λs.(λz.((0 s) ((3 s) z))))',
        '3.	(λs.(λz.((λz.z) ((3 s) z))))',
        '4.	(λs.(λz.((3 s) z)))',
        '5.	(λs.(λz.((λz.(s (s (s z)))) z)))',
        '6.	3',
      ].join('\n'),
    );
  });

  it('3 + 0 = 3', () => {
    cy.get(e('input-area')).clear();
    cy.get(e('input-area')).type('((+ 3) 0)');

    cy.get(e('output-area')).should(
      'have.value',
      [
        '0.	((+ 3) 0)',
        '1.	((λn.(λs.(λz.((3 s) ((n s) z))))) 0)',
        '2.	(λs.(λz.((3 s) ((0 s) z))))',
        '3.	(λs.(λz.((λz.(s (s (s z)))) ((0 s) z))))',
        '4.	(λs.(λz.(s (s (s ((0 s) z))))))',
        '5.	(λs.(λz.(s (s (s ((λz.z) z))))))',
        '6.	3',
      ].join('\n'),
    );
  });

  it('parse error', () => {
    cy.get(e('input-area')).clear();
    cy.get(e('input-area')).type('((+ 0) 0))');

    cy.get(e('output-area')).should('have.value', 'Parse error.');
  });
});

export {};
