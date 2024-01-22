import type { SyntheticEventCreator } from '..';

export const syntheticEventCreator: SyntheticEventCreator = (
  eventName,
  dataToPass
) => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: dataToPass
  });

  dispatchEvent(event);
};

export const checkWindow = (): void => {
  if (window === undefined) {
    throw new Error('window object is not defined.');
  }
};
