export function normalizationMatrix(
  data: (string | number)[][]
): (string | number)[][] {
  return data.map(row => {
    return row.map((value, colIndex) => {
      if (colIndex === 0) return value; // Kolom pertama tetap sama
      // Bagi nilai dengan total kolomnya untuk normalisasi
      if (
        typeof value === "number" &&
        typeof data[data.length - 1][colIndex] === "number"
      ) {
        return parseFloat(
          (value / Number(data[data.length - 1][colIndex])).toFixed(3)
        );
      }
      return value;
    });
  });
}
