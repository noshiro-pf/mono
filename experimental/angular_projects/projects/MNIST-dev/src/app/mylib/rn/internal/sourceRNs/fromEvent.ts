import { RN } from '../RN';

export const fromEvent = (
  target: HTMLElement | null,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
) => new FromEventRN(target, eventType, options);

class FromEventRN extends RN<Event> {
  constructor(
    target: HTMLElement | null,
    eventType: string,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (target === null) {
      throw new Error('"target" is not nullable');
    }

    super(new Event(eventType), []);

    target.addEventListener(eventType, (ev) => this.fireWith(ev), options);
  }
}
