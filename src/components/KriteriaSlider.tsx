import { BsBox } from "react-icons/bs";
import { Slider } from "rsuite";
import "rsuite/Slider/styles/index.css";
import "rsuite/RangeSlider/styles/index.css";
import { useEffect, useState } from "react";
import "@/app/globals.css";
import { matrixConverter } from "@/libs/matrixConverter";

export default function KriteriaSlider({
  kriteria1,
  kriteria2,
  rawValue,
  changePair,
}: {
  kriteria1: string;
  kriteria2: string;
  rawValue: number;
  changePair: (
    kriteria1: string,
    kriteria2: string,
    intensitas: number,
    value: number
  ) => void;
}) {
  const [value, setValue] = useState(rawValue);

  useEffect(() => {
    setValue(rawValue);
  }, [rawValue]);

  useEffect(() => {
    changePair(kriteria1, kriteria2, matrixConverter(value), value);
  }, [value]);

  const labels = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      <div className="flex flex-col border border-white bg-white rounded-md shadow mt-8">
        <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
          <BsBox />
          <p className="font-semibold">
            Perbandingan Kriteria {kriteria1} dan {kriteria2}
          </p>
        </div>

        <div className="flex flex-col my-4 mx-12">
          <Slider
            min={0}
            max={labels.length - 1}
            value={value}
            className="custom-slider"
            handleStyle={{
              borderRadius: 10,
              color: "#fff",
              fontSize: 12,
              width: 32,
              height: 22,
            }}
            tooltip={false}
            handleTitle={labels[value]}
            onChange={setValue}
          />
        </div>
        <div className="flex flex-row justify-between mx-8 mb-6 items-end">
          <div className="w-1/3">
            <p className="text-left">{kriteria1}</p>
          </div>
          <div className="w-1/3">
            <p className="text-xs uppercase font-bold text-center">
              Sama Pentingnya
            </p>
          </div>
          <div className="w-1/3">
            <p className="text-right">{kriteria2}</p>
          </div>
        </div>
      </div>
    </>
  );
}
