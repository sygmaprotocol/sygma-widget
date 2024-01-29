import { css } from 'lit';

export const styles = css`
  .addressInputContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    min-height: 7.75rem;
    height: 100%;
  }

  .inputAddressContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 7.75rem;
    height: 100%;
    gap: 0.5rem;
  }

  .inputAddress {
    border-radius: 1.5rem;
    border: 0.063rem solid var(--zinc-200);
    width: 100%;
    height: 4.25rem;
    font-size: 0.875rem;
    text-align: center;
  }

  .error {
    border-color: red;
  }

  .errorMessage {
    color: red;
    font-weight: 300;
    font-size: 0.75rem;
  }
`;
