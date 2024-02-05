import { afterEach, assert, describe, it } from 'vitest';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { html } from 'lit';
import { LoaderComponent } from '../../../../src/components';

describe('loader-component', function () {
  afterEach(() => {
    fixtureCleanup();
  });

  it('is defined', () => {
    const el = document.createElement('sygma-loader-component');
    assert.instanceOf(el, LoaderComponent);
  });

  it('renders loader when isLoading is true', async () => {
    const el = await fixture(html`
      <sygma-loader-component .isLoading=${true}></sygma-loader-component>
    `);

    const overlay = el.shadowRoot!.querySelector('.loader') as HTMLElement;

    assert.isNotNull(overlay);
  });

  it('does not render loader when isLoading is false', async () => {
    const el = await fixture(html`
      <sygma-loader-component .isLoading=${false}></sygma-loader-component>
    `);

    const overlay = el.shadowRoot!.querySelector('.loader') as HTMLElement;

    assert.isNull(overlay);
  });
});
