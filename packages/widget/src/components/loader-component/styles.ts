import { css } from 'lit';

export const styles = css`
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
  }

  .loading-spinner {
    border: 4px solid var(--blue-600);
    border-top: 4px solid var(--white);
    border-radius: 50%;
    width: 64px;
    height: 64px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
