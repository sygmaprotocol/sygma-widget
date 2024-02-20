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
    cursor: pointer;
    transition: filter 0.3s ease;

    &:hover {
      filter: brightness(120%);
    }

    svg {
      margin-right: 0.5rem;
    }
  }

  // Custom option for dropdown. We are using part as we pass the custom option
  // to the dropdown component as a property
  dropdown-component::part(dropdown) {
    border-radius: 2.5rem;
  }

  dropdown-component::part(dropdownWrapper) {
    padding: 0;
  }

  dropdown-component::part(customOptionContent) {
    display: flex;
    flex-direction: column;
  }

  dropdown-component::part(customOptionContentName) {
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  dropdown-component::part(customOptionContentMain) {
    display: flex;
    align-items: center;
  }

  dropdown-component::part(identicon) {
    max-width: 3rem;
    width: fit-content;
  }

  dropdown-component::part(customOptionContentAccountData) {
    display: flex;
    flex-direction: column;
    margin-left: 0.5rem;
  }

  dropdown-component::part(customOptionContentType) {
    margin-bottom: 0.16rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  dropdown-component::part(customOptionContentAddress) {
    color: #334155;
    font-size: 0.75rem;
    font-weight: 400;
  }

  dropdown-component::part(dropdownContent) {
    margin-top: 0.75rem;
  }

  dropdown-component::part(dropdownTrigger) {
    min-width: 11.5rem;
    border-radius: 2.5rem;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    background: var(--zinc-200);
  }

  dropdown-component::part(substrateDisconnectButton) {
    width: 100%;
    cursor: pointer;
    padding: 0.75rem 1rem;
    color: var(--zinc-800);
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    background: transparent;
    outline: none;
    border: none;
    box-sizing: border-box;
  }

  dropdown-component::part(substrateDisconnectButton):hover {
    background-color: var(--neutral-100);
  }
`;
