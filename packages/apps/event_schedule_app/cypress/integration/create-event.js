const e = (selector) => `[data-cy="${selector}"]`;

const path = (selectorList) => selectorList.map(e).join(' ');

describe('create page', () => {
  it('create event', () => {
    cy.visit('/');

    // create-page
    cy.get(path(['create-page', 'title'])).type('ボドゲ会');
    cy.get(path(['create-page', 'note'])).type('ノート');
    cy.get(path(['create-page', 'datetime-list', 'add-button'])).click();
    cy.get(path(['create-page', 'create-button'])).click();

    // create-event-result-dialog
    cy.get(path(['create-event-result-dialog-body'])).should('be.visible');
    cy.get(path(['create-event-result-dialog-body', 'url-wrapper']), {
      timeout: 20000,
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

    cy.get(path(['create-event-result-dialog-footer', 'back-button'])).should(
      'not.be.disabled'
    );

    cy.get(path(['create-event-result-dialog-footer', 'back-button'])).should(
      'not.be.disabled'
    );

    // remove `target={'_blank'}` to reuse the same window
    cy.get(
      path(['create-event-result-dialog-footer', 'open-answer-page-button'])
    ).invoke('removeAttr', 'target');

    cy.get(
      path(['create-event-result-dialog-footer', 'open-answer-page-button'])
    ).click();

    // answer-page
    cy.get(path(['answer-page'])).should('be.visible');

    cy.get(path(['answer-page', 'add-answer-button'])).click();

    cy.get(path(['answer-page', 'answer-being-edited-section'])).should(
      'be.visible'
    );

    cy.get(
      path(['answer-page', 'answer-being-edited-section', 'buttons'])
    ).should('be.visible');

    cy.get(
      path([
        'answer-page',
        'answer-being-edited-section',
        'buttons',
        'button-with-confirmation',
      ])
    ).should('be.visible');

    // submit button should be disabled if username is not filled
    cy.get(
      path([
        'answer-page',
        'answer-being-edited-section',
        'buttons',
        'button-with-confirmation',
      ])
    ).should('be.disabled');

    cy.get(
      path(['answer-page', 'answer-being-edited-section', 'username'])
    ).type('Alice');

    // submit button should be enabled if username is filled
    cy.get(
      path([
        'answer-page',
        'answer-being-edited-section',
        'buttons',
        'button-with-confirmation',
      ])
    ).should('not.be.disabled');

    // fill all datetime
    cy.get(
      path(['answer-page', 'answer-being-edited-section', 'col-fair-button'])
    ).click();

    cy.get(
      path([
        'answer-page',
        'answer-being-edited-section',
        'buttons',
        'submit-answer-button',
      ])
    ).should('be.visible');

    cy.get(
      path([
        'answer-page',
        'answer-being-edited-section',
        'buttons',
        'submit-answer-button',
      ])
    ).should('not.be.disabled');
  });
});
