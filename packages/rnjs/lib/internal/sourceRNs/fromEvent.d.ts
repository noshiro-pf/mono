import { RN } from '../RN';
export declare const fromEvent: (target: HTMLElement | null, eventType: string, options?: boolean | AddEventListenerOptions | undefined, name?: string) => FromEventRN;
declare class FromEventRN extends RN<Event> {
    private readonly target;
    private readonly eventType;
    private readonly callback;
    private readonly options?;
    constructor(target: HTMLElement | null, eventType: string, options?: boolean | AddEventListenerOptions, name?: string);
    protected complete(): void;
}
export {};
//# sourceMappingURL=fromEvent.d.ts.map