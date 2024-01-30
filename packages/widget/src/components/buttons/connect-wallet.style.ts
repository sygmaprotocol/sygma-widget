import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    justify-content: flex-end;
  }

  .connectWalletButton {
    padding: 6px 8px;
    border-radius: 40px;
    background: var(--zinc-100, #f4f4f5);
    color: var(--zinc-700, #3f3f46);
    border-radius: 12px;
    border: 1px solid var(--gray-100, #f3f4f6);
    background: #fff;
    /* Shadow (SM) */
    box-shadow:
      0px 2px 3px -1px rgba(0, 0, 0, 0.1),
      0px 1px 2px -1px rgba(0, 0, 0, 0.06);
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    cursor: pointer;
  }

  .connectWalletButton:hover {
    background-image: linear-gradient(rgb(0 0 0/3%) 0 0);
  }
`;
