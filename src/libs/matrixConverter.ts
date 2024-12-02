export function matrixConverter(value: number): number {
  const mapping: { [key: number]: number } = {
    0: 9,
    1: 8,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
    9: 1 / 2,
    10: 1 / 3,
    11: 1 / 4,
    12: 1 / 5,
    13: 1 / 6,
    14: 1 / 7,
    15: 1 / 8,
    16: 1 / 9,
  };

  return mapping[value] ?? 1;
}
