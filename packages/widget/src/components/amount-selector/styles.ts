import { css } from 'lit';

export const styles = css`
  .amountSelectorContainer {
    display: flex;
    padding: 0.75rem;
    margin: 0.5rem 0;
    align-items: center;
    border-radius: 1.5rem;
    flex-direction: column;
    border: 0.0625rem solid rgb(228, 228, 231);
    justify-content: center;
  }

  .amountSelectorLabel {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    color: var(--neutral-600);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .amountSelectorSection {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
  }

  .selectorSection {
    width: 100%;
  }

  .amountSelectorInput {
    border: none;
    color: var(--neutral-600);
    font-size: 2.125rem;
    font-weight: 500;
    line-height: 2.5rem;
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
`;
