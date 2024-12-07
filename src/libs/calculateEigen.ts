interface EigenType {
  kriteria?: {
    [kriteria: string]: number;
  };
  subKriteria?: {
    [kriteria: string]: {
      [subKriteria: string]: number;
    };
  };
}

export default function calculateEigen(
  eigen: EigenType,
  alternatif: Record<string, string>
): number {
  let total = 0;

  for (const [key, subKey] of Object.entries(alternatif)) {
    // Pastikan key dan subKey ada dalam data eigen
    if (
      eigen?.kriteria?.[key.toLowerCase()] &&
      eigen?.subKriteria?.[key.toLowerCase()]?.[subKey.toLowerCase()]
    ) {
      const kriteriaWeight = eigen.kriteria[key.toLowerCase()];
      const subKriteriaWeight =
        eigen.subKriteria[key.toLowerCase()][subKey.toLowerCase()];
      total += kriteriaWeight * subKriteriaWeight;
    } else {
      console.warn(
        `Data untuk ${key} atau ${subKey} tidak ditemukan di dalam data eigen.`
      );
    }
  }

  return total;
}
