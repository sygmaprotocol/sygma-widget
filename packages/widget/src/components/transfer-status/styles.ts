import { css } from '@lit/reactive-element';

export const styles = css`
  .transferStatusMainMessage {
    color: var(--zinc-600);
    text-align: center;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.25rem;
  }

  .transferStatusContainer {
    display: flex;
    padding: 0.75rem;
    flex-direction: column;
    align-items: center;
    border-radius: 1.5rem;
    border: 1px solid var(--zinc-200);
  }

  .destinationMessage {
    display: flex;
    flex-direction: row;
    align-items: center;

    & > .networkIcon {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .tokenInfo {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0rem 4.78125rem 0.9375rem 4.78125rem;

    color: var(--zinc-600);
    text-align: center;
    font-size: 1.25rem;
    font-style: normal;
    font-weight: 500;
    line-height: 2.5rem;
    letter-spacing: -0.025rem;
  }

  .transferStatusDescription {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    text-align: center;

    color: var(--zinc-500);
    text-align: center;
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.0625rem;
  }

  .sygmaScanLink {
    color: var(--orange-600);
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.0625rem;
    text-decoration-line: underline;
  }
`;
