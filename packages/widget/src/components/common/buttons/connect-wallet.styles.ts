import { css } from 'lit';

export const connectWalletStyles = css`
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

  .walletAddress {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--zinc-700);
    line-height: 0.9375rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .connectWalletButton {
    display: flex;
    align-items: center;
    padding: 0.38rem 0.75rem;
    border-radius: 2.5rem;
    background: var(--zinc-800);
    color: var(--zinc-200);
    font-size: 0.875rem;
    font-weight: 500;
    outline: none;
    border: none;
    cursor: pointer;
    transition: filter 0.3s ease;

    &:hover {
      filter: brightness(120%);
    }

    svg {
      margin-right: 0.5rem;
    }
  }
`;
