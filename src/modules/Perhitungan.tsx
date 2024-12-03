import { transformData } from "@/libs/transformData";
import { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { BsCalculator } from "react-icons/bs";
import { Mosaic } from "react-loading-indicators";

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

export default function Perhitungan({ eigen }: { eigen: EigenType }) {
  const [data, setData] = useState<{
    name: string;
    children: {
      name: string;
      attributes: { eigen: number };
      children: { name: string; attributes: { eigen: number } }[];
    }[];
  }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eigen) {
      setData(transformData(eigen));
    }
  }, [eigen]);

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <Mosaic color="#1242A2" size="large" />
        <p className="text-azure-700 font-bold text-2xl mt-4">Mohon tunggu</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center text-3xl gap-4">
            <BsCalculator />
            <p className="font-semibold">Data Perhitungan</p>
          </div>
          <div></div>
        </div>
        <div className="flex flex-col border bg-white h-[77vh] rounded-md shadow mt-8">
          <Tree
            data={data}
            scaleExtent={{ min: 0.3, max: 2 }}
            orientation="vertical"
            pathFunc="straight"
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
          />
        </div>
      </div>
    </>
  );
}
