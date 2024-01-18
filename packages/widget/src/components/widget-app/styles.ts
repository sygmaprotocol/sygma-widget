import { css } from 'lit';

export const styles = css`
  .widgetContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    width: 350px;
    height: 476px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--gray-100, #f3f4f6);
    background: #fff;

    box-shadow:
      0px 4px 6px -1px rgba(0, 0, 0, 0.1),
      0px 2px 4px -1px rgba(0, 0, 0, 0.06);

    font-family: 'Bungee Spice';
  }

  .switchNetwork {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    color: var(--neutral-600, #525252);
    text-align: right;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
  }

  .switchNetwork > span:nth-child(2) {
    margin-left: 4px;
  }

  .actionButton {
    display: flex;
    width: 314px;
    padding: 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 16px;
    background: var(--primary-300, #a5b4fc);
    color: #ffffff;
    border: none;
    font-family: Inter;
    font-weight: 500;
    font-size: 16px;
  }

  .actionButton:hover {
    cursor: pointer;
  }

  .actionButton:active {
    background: var(--primary-500-main, #6366f1);
  }

  .actionButtonReady {
    display: flex;
    width: 314px;
    padding: 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 16px;
    background: var(--primary-500-main, #6366f1);
    color: #ffffff;
    border: none;
  }

  .actionButtonReady:active {
    background: var(--primary-300, #a5b4fc);
  }

  .actionButtonReady:hover {
    cursor: pointer;
  }

  .poweredBy {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    margin-top: 16px;
  }

  .poweredBy > span:nth-child(2) {
    margin-left: 6px;
  }
`;
