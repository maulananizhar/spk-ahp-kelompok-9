export function riGenerate(n: number): number {
  const ri = [
    0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57,
    1.59,
  ];
  return ri[n - 1];
}
