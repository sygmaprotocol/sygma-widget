import { css } from 'lit';

export const styles = css`
  .transferDetail {
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
  }

  .transferDetailContainer {
    display: flex;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .transferDetailContainerLabel {
    color: var(--Neutral-700, #404040);
    flex: 1 0 0;
  }

  .transferDetailContainerValue {
    color: var(--zinc-600, #52525b);
    text-align: right;
  }
`;
