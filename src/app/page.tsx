"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BsBox,
  BsBoxes,
  BsCalculator,
  BsGraphUp,
  BsHouseDoor,
  BsLaptop,
} from "react-icons/bs";
import logoUNJ from "@/assets/images/unj.png";
import Kriteria from "@/modules/Kriteria";
import SubKriteria from "@/modules/SubKriteria";
import Perhitungan from "@/modules/Perhitungan";
import axios from "axios";

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

export default function Home() {
  const [menu, setMenu] = useState("dashboard");
  const [eigen, setEigen] = useState<EigenType>({});
  const [eigenData, setEigenData] = useState<EigenType>();

  const changeKriteriaEigen = (data: { [kriteria: string]: number }) => {
    setEigen({ ...eigen, kriteria: data });
  };

  const changeSubKriteriaEigen = (data: {
    [kriteria: string]: { [subKriteria: string]: number };
  }) => {
    const subKriteria = eigen?.subKriteria;
    setEigen({ ...eigen, subKriteria: { ...subKriteria, ...data } });
  };

  async function getEigen() {
    try {
      const response = await axios.get("/api/eigen");
      setEigenData(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data.message);
      }
    }
  }

  async function editEigen(eigen: string) {
    try {
      await axios.post(
        `/api/eigen/edit`,
        {
          eigen: eigen,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data.message);
      }
    }
  }

  useEffect(() => {
    getEigen();
  }, []);

  useEffect(() => {
    if (eigenData) {
      setEigen(eigenData);
    }
  }, [eigenData]);

  useEffect(() => {
    if (eigenData) {
      editEigen(JSON.stringify(eigen));
      return;
    }
  }, [eigen]);

  return (
    <>
      <div className="w-1/6 flex flex-col bg-azure-100 fixed h-full">
        <div className="h-16 flex justify-center items-center">
          <p className="font-extrabold text-2xl text-azure-800">Project SPK</p>
        </div>
        <hr className="mx-6 border-azure-700" />
        <button
          className={`mx-6 py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
            menu === "dashboard" ? "text-azure-800" : "text-azure-700"
          }`}
          onClick={() => setMenu("dashboard")}>
          <BsHouseDoor />
          <p className="font-semibold">Dashboard</p>
        </button>
        <hr className="mx-6 border-azure-700" />
        <div className="mx-6 flex flex-col">
          <p className="text-xs font-bold pt-2 text-azure-700 ">KELOLA DATA</p>
          <button
            className={`py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
              menu === "kriteria" ? "text-azure-800" : "text-azure-700"
            }`}
            onClick={() => setMenu("kriteria")}>
            <BsBox />
            <p className="font-semibold">Data Kriteria</p>
          </button>
          <button
            className={`py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
              menu === "sub-kriteria" ? "text-azure-800" : "text-azure-700"
            }`}
            onClick={() => setMenu("sub-kriteria")}>
            <BsBoxes />
            <p className="font-semibold">Data Sub-Kriteria</p>
          </button>
          <button
            className={`py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
              menu === "alternatif" ? "text-azure-800" : "text-azure-700"
            }`}
            onClick={() => setMenu("alternatif")}>
            <BsLaptop />
            <p className="font-semibold">Data Alternatif</p>
          </button>
          <button
            className={`py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
              menu === "perhitungan" ? "text-azure-800" : "text-azure-700"
            }`}
            onClick={() => setMenu("perhitungan")}>
            <BsCalculator />
            <p className="font-semibold">Data Perhitungan</p>
          </button>
          <button
            className={`py-4 flex flex-row items-center gap-3 active:scale-105 duration-150 ${
              menu === "final" ? "text-azure-800" : "text-azure-700"
            }`}
            onClick={() => setMenu("final")}>
            <BsGraphUp />
            <p className="font-semibold">Data Final</p>
          </button>
        </div>
      </div>
      <div className="h-screen flex flex-row">
        <div className="w-1/6"></div>
        <div className="w-5/6 flex flex-col">
          <div className="py-3 flex justify-end items-center bg-white">
            <p className="font-semibold text-azure-800 mr-6">
              Kelompok 9 - Sistem Pendukung Keputusan 121 - PTIK UNJ 2022
            </p>
            <Image
              className="mr-8 w-9"
              src={logoUNJ}
              alt="UNJ"
              width={160}
              height={160}
            />
          </div>
          <div className="p-8 bg-gray-100">
            {menu === "dashboard" ? (
              <p>dashboard</p>
            ) : menu === "kriteria" ? (
              <Kriteria changeKriteriaEigen={changeKriteriaEigen} />
            ) : menu === "sub-kriteria" ? (
              <SubKriteria changeSubKriteriaEigen={changeSubKriteriaEigen} />
            ) : menu === "alternatif" ? (
              <p>alternatif</p>
            ) : menu === "perhitungan" ? (
              <Perhitungan />
            ) : menu === "penilaian" ? (
              <p>penilaian</p>
            ) : (
              <p>{menu}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
