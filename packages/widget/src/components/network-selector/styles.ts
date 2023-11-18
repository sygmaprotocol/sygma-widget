import { css } from 'lit';

export const styles = css`
  .selectorContainer {
    border-radius: 24px;
    border: 1px solid var(--zinc-200, #e4e4e7);
    display: flex;
    width: 314px;
    padding: 12px 16px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
  }
  .directionLabel {
    color: var(--zinc-400, #a1a1aa);
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1 0 0;
    align-self: stretch;
  }
  .selectorSection {
    display: flex;
    align-items: center;
    gap: 12px;
    align-self: stretch;
    width: inherit;
  }
  .baseSelector {
    width: 100%;
  }
`;
