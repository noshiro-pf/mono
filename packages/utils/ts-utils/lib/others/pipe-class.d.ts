declare class Pipe<A> {
    private a;
    constructor(a: A);
    map<B>(fn: (a: A) => B): Pipe<B>;
    get value(): A;
}
export declare const pipeClass: <A>(a: A) => Pipe<A>;
export {};
//# sourceMappingURL=pipe-class.d.ts.map