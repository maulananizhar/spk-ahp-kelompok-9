export type AlternatifType = {
  _id: string;
  name: string;
  kriteria: {
    [kriteria: string]: string;
  };
  eigen: number;
};
