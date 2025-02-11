function outerFunction() {
  let mut_counter = 0; // defined outside inner function
  return function innerFunction() {
    mut_counter += 1; // counter accessible inside inner function (private variable)
    return mut_counter;
  };
}

const getInnerFunction = outerFunction();

console.log(getInnerFunction()); // prints 1
console.log(getInnerFunction()); // prints 2
console.log(getInnerFunction()); // prints 3
console.log(getInnerFunction()); // prints 4

type ComponentInstance = Readonly<{
  render: () => void;
}>;

type ComponentDef = () => ComponentInstance;

const React = (() => {
  const mut_global: {
    component: ComponentDef | undefined;
    instance: ComponentInstance | undefined;
  } = {
    component: undefined,
    instance: undefined,
  }; // define a global variable where we store information about the component

  let mut_index = 0; // index to keep track of the component's state

  console.log({ mut_index });

  const render = (component: ComponentDef): unknown => {
    mut_global.component = component;
    const instance = component(); // get the instance of the component
    mut_index = 0;
    instance.render();
    mut_global.instance = instance; // store the component's instance for any future calls of the component's functions
    return mut_global; // return the global variable
  };

  const useState = <T,>(initialState: T): T =>
    // implement useState
    initialState;

  const useEffect = (cb: () => void, deps: readonly unknown[]): void => {
    // implement useEffect
    console.log(cb, deps);
  };

  return { render, useState, useEffect };
})();

export { React };
