import { css } from 'lit';

export const styles = css`
  :host {
    --zinc-200: #e4e4e7;
    --zinc-400: #a1a1aa;
    --white: #fff;
    --gray-100: #f3f4f6;
    --neutral-600: #525252;
    --primary-300: #a5b4fc;
    --primary-500: #6366f1;
    --blue-600: #2563eb;
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    src: url('https://fonts.googleapis.com/css2?family=Inter:wght@200..900');
  }

  .widgetContainer {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    padding: 24px;
    width: 21.875rem; /* TODO: remove these hardcoded values */
    border-radius: 12px;
    border: 1px solid var(--gray-100);
    background-color: var(--white);

    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);

    font-family: Inter, sans-serif;
  }

  .noPointerEvents {
    pointer-events: none;
  }

  .networkSelectionWrapper {
    margin: 1rem 0 0.5rem 0;
  }

  .connectAccount {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
  }

  .actionButton {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    border-radius: 16px;
    border: none;
    background-color: var(--primary-300);
    color: #ffffff;

    width: 314px; /* TODO: remove these hardcoded values */
    padding: 12px 20px;

    font-weight: 500;
    font-size: 16px;
  }

  .actionButton:hover {
    cursor: pointer;
  }

  .actionButton:active {
    background-color: var(--primary-500);
  }

  .actionButtonReady {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    width: 100%;
    padding: 12px 20px;

    border-radius: 16px;
    background-color: var(--primary-500);
    color: #ffffff;
    border: none;
  }

  .actionButtonReady:active {
    background-color: var(--primary-300);
  }

  .actionButtonReady:hover {
    cursor: pointer;
  }

  .poweredBy {
    display: flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;

    color: var(--neutral-600);
    font-size: 12px;
    line-height: 150%;
  }
`;
