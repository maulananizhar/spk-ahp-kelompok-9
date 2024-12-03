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

export function transformData(data: EigenType) {
  // Destructure the original object
  const { kriteria, subKriteria } = data;

  // Transform the object
  const result = {
    name: "SPK Laptop",
    children: kriteria
      ? Object.keys(kriteria).map(key => ({
          name: capitalizeFirstLetter(key),
          attributes: { eigen: kriteria[key] },
          children:
            subKriteria && subKriteria[key]
              ? Object.keys(subKriteria[key]).map(subKey => ({
                  name: subKey,
                  attributes: { eigen: subKriteria[key][subKey] },
                }))
              : [],
        }))
      : [],
  };

  return result;
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
