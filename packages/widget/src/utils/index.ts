import { html } from 'lit';
import {
  baseNetworkIcon,
  cronosNetworkIcon,
  ethereumIcon,
  khalaNetworkIcon,
  noNetworkIcon,
  phalaNetworkIcon,
  polygonNetworkIcon
} from '../assets';

export const renderNetworkIcon = (networkChainId?: number) => {
  switch (networkChainId) {
    case 1:
    case 5:
    case 11155111:
    case 17000:
      return html`${ethereumIcon}`;
    case 5231:
    case 5233:
      return html`${phalaNetworkIcon}`;
    case 5232:
      return html`${khalaNetworkIcon}`;
    case 84531:
    case 8453:
      return html`${baseNetworkIcon}`;
    case 338:
    case 25:
      return html`${cronosNetworkIcon}`;
    case 80001:
    case 137:
      return html`${polygonNetworkIcon}`;
    default:
      return html`${noNetworkIcon}`;
  }
};

export const capitalize = (s: string) => {
  const firstLetter = s.charAt(0).toUpperCase();
  const rest = s.slice(1);
  return `${firstLetter}${rest}`;
};
