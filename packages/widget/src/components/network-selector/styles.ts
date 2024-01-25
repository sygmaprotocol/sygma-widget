import { css } from 'lit';

export const styles = css`
  .selectorContainer {
    border-radius: 24px;
    border: 1px solid #e4e4e7;
    display: flex;
    width: 314px;
    max-height: 4.625rem;
    padding: 12px 16px;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: 4px;
  }

  .directionLabel {
    color: #a1a1aa;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 20px;
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
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
    border: none;
  }

  .selectorSection {
    display: flex;
    align-items: center;
    gap: 12px;
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
    padding: 8px;
    box-sizing: border-box;

    input {
      color: #525252;
      font-size: 1.125rem;
      font-weight: 500;
      border: none;
      outline: none;
    }
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
    border: 1px solid #f3f4f6;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 1;
  }

  .show {
    display: block;
  }

  .dropdownOption {
    display: flex;
    align-items: center;
    padding: 12px 16px;
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
    width: 20px;
    height: 20px;
  }
  .networkName {
    margin-left: 0.5rem;
  }
`;
