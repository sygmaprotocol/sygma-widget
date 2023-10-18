import { SyntheticEventCreator } from '..';

export const syntheticEventCreator: SyntheticEventCreator = (
  eventName: string,
  dataToPass: unknown
) => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: dataToPass
  });

  dispatchEvent(event);
};
