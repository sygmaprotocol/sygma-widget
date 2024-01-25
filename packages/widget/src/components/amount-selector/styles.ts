import { css } from 'lit';

export const styles = css`
  .amountSelectorContainer {
    display: flex;
    padding: 4px 12px;
    align-items: center;
    border-radius: 24px;
    width: 314px; /* TODO: remove hardcoded values */
    height: 116px; /* TODO: ↑ */
    flex-direction: column;
  }

  .amountSelectorLabel {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    color: #525252;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px; /* 142.857% */
  }

  .amountSelectorSection {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .amountSelectorInput {
    border: none;
    color: #525252;
    font-size: 34px;
    font-weight: 500;
    line-height: 40px;
    letter-spacing: -0.68px;
    width: 137px; /* TODO: remove hardcoded values */
  }

  .tokenBalanceSection {
    display: flex;
    margin-top: 8px;
    width: 100%;
  }

  .balanceContent {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    gap: 6px;
  }

  .maxButton {
    color: #2563eb;
    border: none;
    background: none;
    font-weight: 500;
  }
`;
