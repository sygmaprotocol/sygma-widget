import { css } from 'lit';

export const styles = css`
  .amountSelectorContainer {
    display: flex;
    padding: 0.75rem;
    align-items: center;
    border-radius: 1.5rem;
    flex-direction: column;
    border: 0.0625rem solid rgb(228, 228, 231);
    justify-content: center;

    &.hasError {
      border-color: var(--red-600);
    }
  }

  .amountSelectorLabel {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    color: var(--neutral-600);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25em;
  }

  .amountSelectorSection {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
  }

  .amountWrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .errorWrapper {
    width: 100%;
  }

  .validationMessage {
    margin-top: 0.5rem;
    color: var(--red-600);
  }

  .amountSelectorInput {
    border: none;
    outline: none;
    color: var(--neutral-600);
    font-size: 2rem;
    font-weight: 500;
    line-height: 1.25em;
    letter-spacing: -0.0425rem;
    width: 8.5625rem;
  }

  .tokenBalanceSection {
    display: flex;
    width: 100%;
  }

  .balanceContent {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    gap: 0.375rem;
  }

  .maxButton {
    cursor: pointer;
    color: var(--blue-600);
    border: none;
    background: none;
    font-weight: 500;
  }

  dropdown-component::part(dropdownWrapper) {
    max-width: 8.1875rem;
    width: 100%;
    border-radius: 2.5rem;
    background: var(--zinc-100);
    min-height: 2.375rem;
    padding: 0 0.5rem;
    box-sizing: border-box;
  }

  dropdown-component::part(optionName) {
    max-width: 4rem;
  }
`;
