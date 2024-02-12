import type { HTMLTemplateResult } from 'lit';
import baseNetworkIcon from './icons/baseNetworkIcon';
import cronosNetworkIcon from './icons/cronosNetworkIcon';
import ethereumIcon from './icons/ethereumNetworkIcon';
import khalaNetworkIcon from './icons/khalaNetworkIcon';
import noNetworkIcon from './icons/noNetworkIcon';
import phalaNetworkIcon from './icons/phalaNetworkIcon';
import polygonNetworkIcon from './icons/polygonNetworkIcon';
import switchNetworkIcon from './icons/switchNetwork';
import sygmaLogo from './icons/sygmaLogo';
import chevronIcon from './icons/chevron';
import gnosisNetworkIcon from './icons/gnosisNetworkIcon';
import loaderIcon from './icons/loaderIcon';

export const networkIconsMap = {
  ethereum: ethereumIcon,
  khala: khalaNetworkIcon,
  phala: phalaNetworkIcon,
  cronos: cronosNetworkIcon,
  base: baseNetworkIcon,
  gnosis: gnosisNetworkIcon,
  polygon: polygonNetworkIcon,
  default: noNetworkIcon
} as const as Record<string, HTMLTemplateResult>;

export {
  ethereumIcon,
  khalaNetworkIcon,
  phalaNetworkIcon,
  cronosNetworkIcon,
  baseNetworkIcon,
  polygonNetworkIcon,
  sygmaLogo,
  switchNetworkIcon,
  noNetworkIcon,
  chevronIcon,
  loaderIcon
};
