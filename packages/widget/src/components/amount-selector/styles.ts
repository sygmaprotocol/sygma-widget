import { css } from 'lit';

export const styles = css`
  .amountSelectorContainer {
    display: flex;
    padding: 4px 12px;
    align-items: center;
    border-radius: 24px;
    width: 314px;
    height: 116px;
    flex-direction: column;
  }
  .amountSelectorLabel {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    color: var(--neutral-600, #525252);
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 142.857% */
  }
  .amountSelectorSection {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .amountSelectorInput {
    border: none;
    color: var(--neutral-600, #525252);
    font-family: Inter;
    font-size: 34px;
    font-style: normal;
    font-weight: 500;
    line-height: 40px; /* 117.647% */
    letter-spacing: -0.68px;
    width: 137px;
  }
`;
