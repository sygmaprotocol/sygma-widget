import { css } from 'lit';

export const styles = css`
  .address-input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }

  .switch-toggle-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .input-address-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 91px;
    gap: 8px;
  }

  .input-address {
    border-radius: 24px;
    border: 1px solid var(--zinc-200, #e4e4e7);
    width: 100%;
    height: 35px;
    font-size: 12px;
    text-align: center;
  }

  .error {
    border-color: red;
  }

  .error-message {
    color: red;
    font-weight: 500;
  }
`;
