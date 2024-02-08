import { SygmaProtocolWidget } from '@buildwithsygma/sygmaprotocol-widget';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sygmaprotocol-widget': SygmaProtocolWidget;
    }
  }
}

export {};