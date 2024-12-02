function extractAverage(process: (string | number)[][]): number[] {
  // Mulai dari index 1 untuk melewati header
  return process
    .slice(1, process.length - 1)
    .map(row => parseFloat(row[1] as string));
}

function extractTotal(matrix: (string | number)[][]): (string | number)[] {
  // Ambil baris terakhir dari input dan hilangkan elemen pertama
  const totalRow = matrix[matrix.length - 1].slice(1);
  // Mengkonversi string angka ke tipe float
  return totalRow.map(Number);
}

export function calculateLambda(
  process: (string | number)[][],
  matriks: (string | number)[][]
): (string | number)[] {
  const arrAverage = extractAverage(process);
  const arrTotal = extractTotal(matriks);
  // Hitung jumlah perkalian antara rata-rata dan total
  const arrLambda = arrAverage.map((value, index) =>
    parseFloat((value * (arrTotal[index] as number)).toFixed(3))
  );
  // push sum array to arrLambda
  const sumLambda = arrLambda.reduce((acc, val) => acc + val, 0);
  arrLambda.push(Number(sumLambda.toFixed(3)));
  return ["Lambda", ...arrLambda];
}
