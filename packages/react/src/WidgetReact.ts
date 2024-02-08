import React from 'react';
import { createComponent } from '@lit/react';
import { SygmaProtocolWidget } from '@buildwithsygma/sygmaprotocol-widget';

export const SygmaProtocolReactWidget = createComponent<SygmaProtocolWidget>({
  tagName: 'sygmaprotocol-widget',
  elementClass: SygmaProtocolWidget,
  react: React
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sygmaprotocol-widget': SygmaProtocolWidget;
    }
  }
}