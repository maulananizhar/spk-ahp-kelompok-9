// Definisikan tipe untuk objek input
type PairwiseComparison = {
  kriteria1: string;
  kriteria2: string;
  intensitas: number;
  value: number;
};

function extractUniqueCriteria(input: PairwiseComparison[]): string[] {
  // Buat sebuah set untuk menyimpan nilai unik
  const uniqueCriteria = new Set<string>();

  // Iterasi melalui setiap objek dan tambahkan kriteria ke set
  input.forEach(item => {
    uniqueCriteria.add(item.kriteria1);
    uniqueCriteria.add(item.kriteria2);
  });

  // Konversi set menjadi array dan kembalikan
  return Array.from(uniqueCriteria);
}

// Fungsi untuk mengubah array input menjadi matriks yang diinginkan
export function transformMatrix(
  input: PairwiseComparison[]
): (string | number)[][] {
  const kriteria = extractUniqueCriteria(input);
  const size = kriteria.length;

  // Inisialisasi matriks 4x4 dengan nilai 1 pada diagonal utama
  const matrix: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );

  // Mengisi matriks berdasarkan input intensitas
  input.forEach(({ kriteria1, kriteria2, intensitas }) => {
    const row = kriteria.indexOf(kriteria1);
    const col = kriteria.indexOf(kriteria2);

    // Jika posisi ditemukan, masukkan nilai intensitas dan kebalikannya
    if (row !== -1 && col !== -1) {
      matrix[row][col] = parseFloat(intensitas.toFixed(3));
      matrix[col][row] = parseFloat((1 / intensitas).toFixed(3));
    }
  });

  // Menambahkan header di bagian atas
  const result: (string | number)[][] = [["", ...kriteria]];

  // Menambahkan setiap baris matriks ke result
  for (let i = 0; i < size; i++) {
    result.push([kriteria[i], ...matrix[i]]);
  }

  // Menambahkan baris "Total" di bagian bawah matriks
  const totalRow: (string | number)[] = ["Total"];
  for (let j = 0; j < size; j++) {
    const columnTotal = matrix.reduce((sum, row) => sum + row[j], 0);
    totalRow.push(parseFloat(columnTotal.toFixed(3))); // Menyimpan hasil dengan 3 desimal
  }
  result.push(totalRow); // Menambahkan baris total ke result

  return result;
}
