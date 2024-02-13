import { fixture, fixtureCleanup, nextFrame } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { afterEach, assert, describe, it, vi } from 'vitest';

import { Button } from '../../../../../src/components/common';

describe('sygma button component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-button');
    assert.instanceOf(el, Button);
  });

  it('displays the button text', async () => {
    const el = await fixture<Button>(
      html`<sygma-button text="Click me"></sygma-button>`
    );
    assert.equal(el.text, 'Click me');
    assert.include(el.shadowRoot?.textContent || '', 'Click me');
  });

  it('does not handle the click event when disabled', async () => {
    const onClickMock = vi.fn();
    const el = await fixture(
      html`<sygma-button
        @onClick=${onClickMock}
        .disabled=${true}
      ></sygma-button>`
    );

    el.shadowRoot?.querySelector('button')?.click();
    await nextFrame();

    assert.equal(onClickMock.mock.calls.length, 0);
  });

  it('shows loader icon when loading', async () => {
    const el = await fixture(
      html`<sygma-button .isLoading=${true}></sygma-button>`
    );
    await nextFrame();

    const loader = el.shadowRoot?.querySelector('.loaderIcon');
    assert.isNotNull(
      loader,
      'Loader icon (SVG) should be present when loading'
    );
  });

  it('applies correct classes based on properties', async () => {
    const el = await fixture(
      html`<sygma-button .disabled=${true} .isLoading=${true}></sygma-button>`
    );
    await nextFrame();
    const buttonElement = el.shadowRoot?.querySelector(
      'button'
    ) as HTMLButtonElement;

    const classList = buttonElement?.classList;
    assert.isTrue(classList.contains('disabled'));
    assert.isTrue(classList.contains('loading'));
  });
});
