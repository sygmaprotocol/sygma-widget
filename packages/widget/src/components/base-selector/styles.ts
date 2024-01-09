import { css } from 'lit';

export const styles = css`
  .selector {
    width: 100%;
    color: var(--neutral-600, #525252);
    font-family: Inter;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 26px;
    border: none;
  }
  .selectorSection {
    display: flex;
    align-items: center;
    gap: 12px;
    align-self: stretch;
    width: inherit;
  }
`;
