import React, { useState } from "react";
import { Sub } from "./sub";

export const App = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div style={{ padding: "20px" }}>
      <Sub count={count} increment={() => setCount((x) => x + 1)} />
    </div>
  );
};
