import failOnConsoleError from 'cypress-fail-on-console-error';

failOnConsoleError();

const e = (selector: string): string => `[data-cy="${selector}"]`;

describe('main', () => {
  const rollButton = e('roll-dice-button');
  const undoButton = e('undo-button');
  const redoButton = e('redo-button');
  const redoCount = e('roll-count');

  it('visit', () => {
    cy.visit('/');
    cy.get(rollButton).should('be.visible');
    cy.get(undoButton).should('be.visible');
    cy.get(redoButton).should('be.visible');
    cy.get(redoCount).should('be.visible');
  });

  it('initial state', () => {
    cy.get(rollButton).should('not.be.disabled');
    cy.get(undoButton).should('be.disabled');
    cy.get(redoButton).should('be.disabled');
    cy.get(redoCount).should('have.text', 'N = 0');
  });

  it('after roll twice', () => {
    cy.get(rollButton).click();
    cy.get(rollButton).click();

    cy.get(rollButton).should('not.be.disabled');
    cy.get(undoButton).should('not.be.disabled');
    cy.get(redoButton).should('be.disabled');

    cy.get(redoCount).should('have.text', 'N = 2');
  });

  it('after click undo once', () => {
    cy.get(undoButton).click();

    cy.get(rollButton).should('not.be.disabled');
    cy.get(undoButton).should('not.be.disabled');
    cy.get(redoButton).should('not.be.disabled');

    cy.get(redoCount).should('have.text', 'N = 1');
  });

  it('then click roll dice', () => {
    cy.get(rollButton).click();

    cy.get(rollButton).should('not.be.disabled');
    cy.get(undoButton).should('not.be.disabled');
    cy.get(redoButton).should('be.disabled');

    cy.get(redoCount).should('have.text', 'N = 2');
  });
});
