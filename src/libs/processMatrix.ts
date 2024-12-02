export function processMatrix(
  input: (string | number)[][]
): [string, string | number][] {
  // Hasil output array yang akan dikembalikan
  const output: [string, string | number][] = [["Jumlah", "Eigen"]];

  // Iterasi mulai dari baris kedua hingga terakhir untuk menghitung jumlah dan rata-rata
  for (let i = 1; i < input.length; i++) {
    const row = input[i];

    // Hitung jumlah nilai dalam baris, mulai dari indeks 1 karena indeks 0 adalah label
    const sum = Number(
      row.slice(1).reduce((acc, val) => Number(acc) + (val as number), 0)
    );

    // Hitung rata-rata nilai dalam baris
    const average = sum / (row.length - 1);

    // Push hasil ke dalam output, format tiga desimal
    output.push([sum.toFixed(3), average.toFixed(3)]);
  }

  return output;
}
