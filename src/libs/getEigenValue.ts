// function getValue(data: (string | number)[][]): number[] {
//   // Mengambil indeks ke-1 dari setiap sub-array
//   const result = data.map(subArray => Number(subArray[1]));
//   // Menghilangkan elemen indeks ke-0 dari hasil
//   return result.slice(1, -1);
// }

import { KriteriaType } from "@/types/KriteriaType";

export function getEigenValue(
  attributes: KriteriaType[],
  data: (string | number)[][]
): { [kriteria: string]: number } {
  function getValue(data: (string | number)[][]): number[] {
    // Mengambil indeks ke-1 dari setiap sub-array
    const result = data.map(subArray => Number(subArray[1]));
    // Menghilangkan elemen indeks ke-0 dari hasil
    return result.slice(1, -1);
  }

  const value = getValue(data);
  // Menggunakan reduce untuk membuat objek pasangan
  return Object.fromEntries(
    attributes.map((attr, index) => [attr.name.toLowerCase(), value[index]])
  );
}
