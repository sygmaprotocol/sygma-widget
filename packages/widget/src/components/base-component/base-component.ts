import type { CSSResultGroup } from 'lit';
import { LitElement } from 'lit';
import { resetCSS } from './reset';

export abstract class Component extends LitElement {
  private static _styles: CSSResultGroup;

  static get styles(): CSSResultGroup {
    const derivedStyles = this._styles || [];

    return [
      resetCSS,
      ...(Array.isArray(derivedStyles) ? derivedStyles : [derivedStyles])
    ];
  }

  static set styles(styles: CSSResultGroup) {
    this._styles = styles;
  }
}
