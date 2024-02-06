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

  .loadingSpinner {
    border: 0.25rem solid var(--blue-600);
    border-top: 4px solid var(--white);
    border-radius: 50%;
    width: 4rem;
    height: 4rem;
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
