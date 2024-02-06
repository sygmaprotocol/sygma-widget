import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .connectWalletContainer {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  .walletAddress,
  .connectWalletButton {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--zinc-700);
    line-height: 0.9375rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .connectWalletButton {
    padding: 0.375rem 0.5rem;
    border-radius: 2.5rem;
    background-color: var(--zinc-100);
    border: 1px solid var(--gray-100);
    cursor: pointer;
  }

  .connectWalletButton:hover {
    background-image: linear-gradient(rgb(0 0 0/3%) 0 0);
  }
`;
