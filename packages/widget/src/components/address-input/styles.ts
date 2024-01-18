import { css } from 'lit';

export const styles = css`
  .switcher {
    --md-sys-color-primary: var(--primary-500-main, #6366f1);
    --md-switch-track-color: #ffffff;
    --md-switch-selected-handle-color: #ffffff;
    --md-switch-track-height: 25px;
    --md-switch-track-width: 45px;
    --md-switch-selected-handle-height: 17px;
    --md-switch-selected-handle-width: 17px;
  }

  .switch-container {
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
    width: 309px;
    height: 91px;
    gap: 8px;
  }

  .input-address {
    border-radius: 24px;
    border: 1px solid var(--zinc-200, #e4e4e7);
    width: 320px;
    height: 35px;
    font-size: 13px;
    text-align: center;
  }
`;
