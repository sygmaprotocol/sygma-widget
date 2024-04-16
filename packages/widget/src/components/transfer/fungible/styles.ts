import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    justify-content: center;
  }

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .amountOnDestination {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.5rem;
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;
