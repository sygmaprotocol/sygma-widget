import { css } from 'lit';

export const styles = css`
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 0.75rem;
  }

  .loadingSpinner {
    border: 0.25rem solid var(--blue-600);
    border-top: 0.25 solid var(--white);
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
