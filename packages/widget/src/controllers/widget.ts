import type { ReactiveController, ReactiveElement } from 'lit';

export class WidgetController implements ReactiveController {
  public isLoading: boolean = false;

  host: ReactiveElement;

  constructor(
    host: ReactiveElement,
  ) {
    (this.host = host).addController(this);
  }

  hostConnected(): void {
  }

  hostDisconnected(): void {
  }
}
