// import failOnConsoleError from 'cypress-fail-on-console-error';

// TODO: enable this
// failOnConsoleError();

const e = (selector: string): string => `[data-cy="${selector}"]`;

const path = (selectorList: readonly string[]): string =>
  selectorList.map(e).join(' ');

describe('main', () => {
  it('visit', () => {
    cy.visit('/');

    cy.get(path(['title'])).should('be.visible');
  });

  it('create event', () => {
    // create-page
    cy.get(e('create-page')).within(() => {
      cy.get(path(['title'])).type('ボドゲ会');
      cy.get(path(['note'])).type('ノート');
      cy.get(path(['datetime-list', 'add-button'])).click();
      cy.get(path(['datetime-list', 'add-button'])).click();

      cy.get(path(['create-button'])).click();
    });

    // create-event-result-dialog
    cy.get(path(['create-event-result-dialog-body'])).should('be.visible');
    cy.get(path(['create-event-result-dialog-body', 'url-wrapper']), {
      timeout: 20_000,
    }).should('be.visible');
    cy.get(path(['create-event-result-dialog-footer', 'back-button'])).should(
      'be.visible'
    );
    cy.get(
      path(['create-event-result-dialog-body', 'clipboard-button'])
    ).should('be.visible');

    cy.get(path(['create-event-result-dialog-footer', 'back-button'])).should(
      'be.disabled'
    );

    cy.get(
      path(['create-event-result-dialog-body', 'clipboard-button'])
    ).click();

    cy.get(e('create-event-result-dialog-footer')).within(() => {
      cy.get(e('back-button')).should('not.be.disabled');

      // remove `target={'_blank'}` to reuse the same window
      cy.get(e('open-answer-page-button')).invoke('removeAttr', 'target');

      cy.get(e('open-answer-page-button')).click();
    });
  });

  it('add answers', () => {
    // answer-page
    cy.get(e('answer-page')).should('be.visible');

    createAnswer('Alice');
    createAnswer('Bob');
  });

  it('edit event', () => {
    cy.get(e('answer-page')).within(() => {
      cy.get(e('edit-event-settings')).click();
    });

    cy.get(e('edit-event-schedule-page')).within(() => {
      cy.get(e('diff-ul')).children().should('have.length', 0);

      cy.get(e('title')).should('have.value', 'ボドゲ会');
      cy.get(e('note')).should('have.value', 'ノート\n');

      cy.get(`${e('submit-button')} > button`).as('edit-page-submit-button');

      cy.get('@edit-page-submit-button').should('be.visible');
      cy.get('@edit-page-submit-button').should('be.disabled');

      cy.get(`${e('icon-settings')} ${e('fair-point-input')} input`).as(
        'fair-point-input'
      );

      cy.get('@fair-point-input').clear();
      cy.get('@fair-point-input').type('7');
      cy.get('@fair-point-input').blur();

      cy.get('@edit-page-submit-button').should('not.be.disabled');
      cy.get('@edit-page-submit-button').click();
    });

    // answer-page
    cy.get(e('answer-page')).should('be.visible');
  });
});

/**
 * @param {string} username
 */
const createAnswer = (username: string): void => {
  cy.get(e('answer-page')).within(() => {
    // create answer
    cy.get(e('add-answer-button'), { timeout: 15_000 }).click();

    cy.get(e('answer-being-edited-section')).should('be.visible');

    cy.get(e('answer-being-edited-section')).within(() => {
      cy.get(path(['buttons'])).should('be.visible');

      cy.get(path(['buttons', 'button-with-confirmation'])).should(
        'be.visible'
      );

      // submit button should be disabled if username is not filled
      cy.get(path(['buttons', 'button-with-confirmation'])).should(
        'be.disabled'
      );

      cy.get(path(['username'])).type(username);

      // submit button should be enabled if username is filled
      cy.get(path(['buttons', 'button-with-confirmation'])).should(
        'not.be.disabled'
      );

      // fill all datetime
      cy.get(path(['col-fair-button'])).click();

      cy.get(path(['buttons', 'submit-answer-button'])).should('be.visible');

      cy.get(path(['buttons', 'submit-answer-button'])).should(
        'not.be.disabled'
      );

      cy.get(path(['buttons', 'submit-answer-button'])).click();
    });

    cy.get(path(['refresh-answers'])).should('be.disabled');
  });
};

export {};
