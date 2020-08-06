import { RN } from '../RN';

export const fromEvent = (
  target: HTMLElement | null,
  eventType: string,
  options?: boolean | AddEventListenerOptions,
  name: string = ''
): FromEventRN => new FromEventRN(target, eventType, options, name);

class FromEventRN extends RN<Event> {
  private readonly target: HTMLElement;
  private readonly eventType: string;
  private readonly callback: (ev: Event) => void;
  private readonly options?: boolean | AddEventListenerOptions;

  constructor(
    target: HTMLElement | null,
    eventType: string,
    options?: boolean | AddEventListenerOptions,
    name: string = ''
  ) {
    if (target === null) {
      throw new Error('"target" must be non-null HTMLElement');
    }

    super(new Event(eventType), [], name);

    this.target = target;
    this.eventType = eventType;
    this.callback = (ev: Event) => this.fireWith(ev);
    this.options = options;

    this.target.addEventListener(this.eventType, this.callback, this.options);
  }

  protected complete() {
    this.target.removeEventListener(
      this.eventType,
      this.callback,
      this.options
    );
  }
}
