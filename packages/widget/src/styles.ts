import { css } from 'lit';

export const styles = css`
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    src: url('https://fonts.googleapis.com/css2?family=Inter:wght@200..900');
  }

  .widgetContainer {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;

    padding: 24px;
    width: 350px; /* TODO: remove these hardcoded values */
    height: 476px; /* TODO: ↑ */
    border-radius: 12px;
    border: 1px solid #f3f4f6;
    background-color: #fff;

    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);

    font-family: Inter, sans-serif;
  }

  .widgetHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
  }

  .widgetContainer .brandLogoContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .widgetHeader .brandLogo {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .widgetHeader .brandLogo svg {
    height: 100%;
    width: 100%;
  }

  .widgetHeader .title {
    color: var(--zinc-400, #a1a1aa);
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
  }

  .widgetContent {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 4px;
  }

  .networkSelectionWrapper {
    margin: 1rem 0 0.5rem 0;
  }

  .actionButton {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    border-radius: 16px;
    border: none;
    background-color: #a5b4fc;
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
    background-color: #6366f1;
  }

  .actionButtonReady {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    width: 100%;
    padding: 12px 20px;

    border-radius: 16px;
    background-color: #6366f1;
    color: #ffffff;
    border: none;
  }

  .actionButtonReady:active {
    background-color: #a5b4fc;
  }

  .actionButtonReady:hover {
    cursor: pointer;
  }

  .poweredBy {
    display: flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;

    color: #525252;
    font-size: 12px;
    line-height: 150%;
  }
`;
