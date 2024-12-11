import { SubKriteriaType } from "@/types/KriteriaType";

export default function countSubKriteria(
  data: SubKriteriaType[],
  criteria: string
): number {
  // Filter data berdasarkan kriteria tertentu
  const filteredData = data.filter(item => item.kriteria === criteria);

  // Hitung jumlah item hasil filter
  return filteredData.length;
}
