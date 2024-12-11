"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import {
  BsBox,
  BsBoxArrowRight,
  BsBoxes,
  BsCalculator,
  BsHouseDoor,
  BsLaptop,
} from "react-icons/bs";
import logoUNJ from "@/assets/images/unj.png";
import Kriteria from "@/modules/Kriteria";
import SubKriteria from "@/modules/SubKriteria";
import Perhitungan from "@/modules/Perhitungan";
import axios from "axios";
import Alternatif from "@/modules/Alternatif";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/services/storage";
import jwt from "jsonwebtoken";
import { Mosaic } from "react-loading-indicators";
import Dashboard from "@/modules/Dashboard";

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

type PayloadToken = {
  _id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
};

type RefreshType = {
  status: string;
  message: string;
  accessToken: string;
};

export default function Home() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [loading, setLoading] = useState<boolean>(true);
  const [menu, setMenu] = useState("dashboard");
  const [eigen, setEigen] = useState<EigenType>({});
  const [eigenData, setEigenData] = useState<EigenType>();

  async function refreshToken() {
    try {
      const response = await axios.post<RefreshType>(
        "/api/auth/token",
        {},
        {
          withCredentials: true,
        }
      );

      auth.setToken(response.data.accessToken);
      const decoded = jwt.decode(response.data.accessToken) as PayloadToken;

      if (decoded) {
        auth.setId(decoded._id);
        auth.setUsername(decoded.username);
        auth.setRole(decoded.role);
        auth.setExpire(decoded.exp);
        setLoading(false);
      }
    } catch {
      router.push("/auth/login");
    }
  }

  async function logoutHandler() {
    try {
      await axios.delete(`/api/auth/logout`, {
        withCredentials: true,
      });
      router.push("/auth/login");
    } catch {
      router.push("/auth/login");
    }
  }

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
        console.error(err.response?.data.message);
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
        console.error(err.response?.data.message);
      }
    }
  }

  useEffect(() => {
    getEigen();
    refreshToken();
  }, []);

  useEffect(() => {
    if (eigenData) {
      setEigen(eigenData);
    }
  }, [eigenData]);

  useEffect(() => {
    async function updateAlternatif() {
      try {
        await axios.post(`/api/alternatif/edit-all`);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error(err.response?.data.message);
        }
      }
    }

    if (eigenData) {
      editEigen(JSON.stringify(eigen));
      updateAlternatif();
      return;
    }
  }, [eigen]);

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
            <p className="font-semibold">Hasil Perhitungan</p>
          </button>
        </div>
        <hr className="mt-auto mx-6 border-red-800" />
        <div className="my-4 mx-4 flex flex-col">
          <button
            className="py-2 px-3 mt-auto flex flex-row items-center gap-3 active:scale-105 duration-150 text-red-800"
            onClick={logoutHandler}>
            <BsBoxArrowRight />
            <p className="font-semibold">Keluar</p>
          </button>
        </div>
        <hr className="mx-6 mb-4 border-red-800" />
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
              <Dashboard />
            ) : menu === "kriteria" ? (
              <Kriteria changeKriteriaEigen={changeKriteriaEigen} />
            ) : menu === "sub-kriteria" ? (
              <SubKriteria changeSubKriteriaEigen={changeSubKriteriaEigen} />
            ) : menu === "alternatif" ? (
              <Alternatif />
            ) : menu === "perhitungan" ? (
              <Perhitungan eigen={eigen} />
            ) : (
              <p>{menu}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
