import { type Float32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const toFloat32 = (x: number): Float32 => {
  const arr = new Float32Array([x]);
  return arr[0] as Float32;
};

const shader = (_vertices: readonly Float32[]): void => {
  // WebGL shader processing
};

// embed-sample-code-ignore-below
export { shader, toFloat32 };
