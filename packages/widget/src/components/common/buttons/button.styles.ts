import { css } from 'lit';

export const buttonStyles = css`
  .button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    background: var(--zinc-900, #18181b);
    color: var(--zinc-200, #e4e4e7);
    text-align: center;
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.5em;
    max-height: 3rem;
    box-sizing: border-box;
    outline: none;
    border: none;
    cursor: pointer;
    transition: filter 0.3s ease;

    svg {
      margin-right: 0.5rem;
      animation: rotate 1.5s linear infinite;
    }

    &.disabled,
    &.loading {
      cursor: not-allowed;
    }

    &:active,
    &:hover {
      filter: brightness(140%);
    }

    &.disabled {
      color: var(--zinc-400, #a1a1aa);
      background: var(--zinc-200, #e4e4e7);

      &:hover {
        filter: brightness(80%);
      }
    }

    &.loading {
      color: var(--zinc-200, #e4e4e7);
      background: var(--zinc-500, #71717a);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
