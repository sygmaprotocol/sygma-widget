import { Provider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum: Provider;
  }
}
