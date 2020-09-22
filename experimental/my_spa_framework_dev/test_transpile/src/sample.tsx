import React from "react";

const a = 0;
const b = <div />;
const fib = (n: number) => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

console.log(a, b, fib(5));
