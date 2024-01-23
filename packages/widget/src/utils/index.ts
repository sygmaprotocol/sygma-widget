import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import {
  baseNetworkIcon,
  cronosNetworkIcon,
  ethereumIcon,
  khalaNetworkIcon,
  noNetworkIcon,
  phalaNetworkIcon,
  polygonNetworkIcon
} from '../assets';

export const renderNetworkIcon = (
  networkChainId?: number
): HTMLTemplateResult | undefined => {
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
  }
  return undefined;
};

export const renderNoNetworkIcon = (): HTMLTemplateResult => {
  return html`${noNetworkIcon}`;
};

export const capitalize = (s: string): string => {
  const firstLetter = s.charAt(0).toUpperCase();
  const rest = s.slice(1);
  return `${firstLetter}${rest}`;
};

export const validatePolkadotAddress = (address: string): boolean => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
};
