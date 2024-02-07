import { css } from 'lit';

export const styles = css`
  .selectorContainer {
    border-radius: 1.5rem;
    border: 0.0625rem solid #e4e4e7;
    display: flex;
    max-width: 19.625rem;
    max-height: 4.625rem;
    padding: 0.75rem 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: 0.25rem;
  }

  .directionLabel {
    color: #a1a1aa;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .baseSelector {
    width: 100%;
  }

  .selector {
    width: 100%;
    color: #525252;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.625rem;
    border: none;
  }

  .selectorSection {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .dropdown {
    position: relative;
    width: 100%;
  }

  .selectedNetwork {
    display: flex;
    align-items: center;
  }

  .dropdownTrigger {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0.25rem 0;
    box-sizing: border-box;
  }

  .chevron {
    transform: rotate(0deg);
    transition: transform 0.3s ease;

    &.open {
      transform: rotate(180deg);
    }
  }

  .dropdownContent {
    display: none;
    position: absolute;
    background-color: white;
    width: 100%;
    border-radius: 0.75rem;
    border: 0.0625rem solid #f3f4f6;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    z-index: 1;
    margin-top: 1rem;
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

    svg {
      max-width: 1.43656rem;
      width: 100%;
    }

    &:hover {
      background-color: #e9e4dd;
    }
  }

  .networkIcon {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
  }

  .networkName {
    margin-left: 0.5rem;
  }
`;
