import { css } from 'lit';

export const styles = css`
  .dropdownWrapper {
    min-width: 7.5rem;
    padding: 0.75rem 1rem;
    position: relative;
    height: 100%;
  }

  .dropdown {
    outline: none;
    height: 100%;
    width: 100%;
  }

  .dropdownTrigger {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0.25rem 0;
    box-sizing: border-box;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .chevron {
    display: flex;
    align-items: center;
    transform: rotate(0deg);
    transition: transform 0.3s ease;

    &.open {
      transform: rotate(180deg);
    }
  }

  .dropdownContent {
    display: none;
    position: absolute;
    background-color: var(--white);
    width: 100%;
    left: 0;
    min-width: fit-content;
    border-radius: 0.75rem;
    border: 0.0625rem solid var(--gray-100);
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    z-index: 1;
  }

  .show {
    display: block;
  }

  .dropdownOption {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border-bottom: 1px solid var(--zinc-200);

    &:last-child {
      border-bottom: none;
    }

    svg {
      max-width: 1.43656rem;
      width: 100%;
    }

    &:hover {
      background-color: var(--neutral-100);
    }
  }

  .selectedOption {
    display: flex;
    align-items: center;
  }

  .networkIcon {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
  }

  .optionName {
    margin-left: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdownLabel {
    color: var(--zinc-400);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
