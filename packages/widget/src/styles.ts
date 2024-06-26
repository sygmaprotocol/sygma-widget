import { css } from 'lit';

export const styles = css`
  :host {
    --zinc-100: #f4f4f5;
    --zinc-200: #e4e4e7;
    --zinc-400: #a1a1aa;
    --zinc-500: #71717a;
    --zinc-700: #3f3f46;
    --zinc-800: #27272a;
    --zinc-900: #18181b;
    --white: #fff;
    --gray-100: #f3f4f6;
    --neutral-100: #f5f5f5;
    --neutral-500: #334155;
    --neutral-600: #525252;
    --primary-300: #a5b4fc;
    --primary-500: #6366f1;
    --blue-600: #2563eb;
    --orange-600: #ea580c;
    --red-600: #dc2626;
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
    align-items: stretch;
    padding: 1.5rem;
    max-width: 22.9375rem;
    min-height: 29.75rem;
    box-sizing: border-box;
    border-radius: 0.75rem;
    border: 0.0625rem solid var(--gray-100);
    background-color: var(--white);
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    font-family: Inter, sans-serif;
  }

  .noPointerEvents {
    pointer-events: none;
  }

  .networkSelectionWrapper {
    margin: 1rem 0;
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

  .widgetHeader .title {
    color: var(--zinc-400);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  .widgetContent {
    margin-top: 1rem;
  }

  .networkSelectionWrapper {
    margin: 1rem 0 0.5rem 0;
  }

  .poweredBy {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    align-self: flex-start;
    color: var(--neutral-600);
    font-size: 0.75rem;
    line-height: 150%;
  }
`;
