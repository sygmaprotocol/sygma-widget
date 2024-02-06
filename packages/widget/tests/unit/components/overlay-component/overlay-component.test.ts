import { afterEach, assert, describe, it } from 'vitest';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { OverlayComponent } from '../../../../src/components';

describe('loader-component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-overlay-component');
    assert.instanceOf(el, OverlayComponent);
  });

  it('renders loader', async () => {
    const el = await fixture(html`
      <sygma-overlay-component></sygma-overlay-component>
    `);

    const overlay = el.shadowRoot!.querySelector('.overlay') as HTMLElement;

    assert.isNotNull(overlay);
  });
});
