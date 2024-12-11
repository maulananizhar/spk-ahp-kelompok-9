"use client";

import { AuthContext } from "@/services/storage";
import { PayloadToken } from "@/types/PayloadToken";
import { RefreshType } from "@/types/RefreshType";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { BsTable } from "react-icons/bs";
import jwt from "jsonwebtoken";
import { Mosaic } from "react-loading-indicators";
import { KriteriaType, SubKriteriaType } from "@/types/KriteriaType";
import countSubKriteria from "@/libs/countSubKriteria";
import { AlternatifType } from "@/types/AlternatifType";

export default function Dashboard() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [loading, setLoading] = useState<boolean>(true);
  const [kriteria, setKriteria] = useState<{
    status: string;
    data: KriteriaType[];
  }>();
  const [subKriteria, setSubKriteria] = useState<{
    status: string;
    data: SubKriteriaType[];
  }>();
  const [terbaik, setTerbaik] = useState<{
    status: string;
    data: AlternatifType[];
  }>();
  const [terburuk, setTerburuk] = useState<{
    status: string;
    data: AlternatifType[];
  }>();

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
        fetchKriteria()
          .then(() => fetchSubKriteria())
          .then(() => fetchTerbaik())
          .then(() => fetchTerburuk())
          .then(() => setLoading(false));
      }
    } catch {
      router.push("/auth/login");
    }
  }

  async function fetchKriteria() {
    const res = await axios.post<{
      status: string;
      data: KriteriaType[];
    }>(
      `/api/kriteria`,
      {},
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setKriteria(res.data);
  }

  async function fetchSubKriteria() {
    const res = await axios.post<{
      status: string;
      data: SubKriteriaType[];
    }>(
      `/api/sub-kriteria`,
      { kriteria: "" },
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setSubKriteria(res.data);
  }

  useEffect(() => {
    refreshToken();
  }, []);

  async function fetchTerbaik() {
    const res = await axios.post<{
      status: string;
      data: AlternatifType[];
    }>(
      `/api/alternatif`,
      { sort: "laptop-terbaik", page: "1", limit: "5" },
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setTerbaik(res.data);
  }

  async function fetchTerburuk() {
    const res = await axios.post<{
      status: string;
      data: AlternatifType[];
    }>(
      `/api/alternatif`,
      { sort: "laptop-terburuk", page: "1", limit: "5" },
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setTerburuk(res.data);
  }

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
      <div className="flex flex-col border border-white rounded-md shadow">
        <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
          <BsTable />
          <p className="font-semibold">Daftar Kriteria</p>
        </div>
        <div className="flex flex-col py-4 px-6 bg-white">
          <div className="mb-4">
            <table className="w-full border">
              <thead className="bg-azure-100 text-azure-700">
                <tr>
                  <th className="w-1/12 border py-2 px-3">No</th>
                  <th className="w-8/12 border py-2 px-3">Nama Kriteria</th>
                  <th className="border py-2 px-3">Jumlah Sub-Kriteria</th>
                </tr>
              </thead>
              <tbody>
                {kriteria?.data.map((item, index) => (
                  <>
                    <tr key={item._id}>
                      <td className="w-1/12 border py-2 px-3 text-center">
                        {index + 1}
                      </td>
                      <td className="w-8/12 border py-2 px-3">{item.name}</td>
                      <td className="border py-2 px-3 text-center">
                        {countSubKriteria(subKriteria?.data ?? [], item.name)}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="border rounded flex flex-row"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <div className="flex flex-col border border-white rounded-md shadow mt-4">
            <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
              <BsTable />
              <p className="font-semibold">5 Laptop terbaik</p>
            </div>
            <div className="flex flex-col py-4 px-6 bg-white">
              <div className="mb-4">
                <table className="w-full border">
                  <thead className="bg-azure-100 text-azure-700">
                    <tr>
                      <th className="w-1/12 border py-2 px-3">No</th>
                      <th className="w-8/12 border py-2 px-3">Nama Laptop</th>
                      <th className="border py-2 px-3">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terbaik?.data.map((item, index) => (
                      <>
                        <tr key={item._id}>
                          <td className="w-1/12 border py-2 px-3 text-center">
                            {index + 1}
                          </td>
                          <td className="w-8/12 border py-2 px-3">
                            {item.name}
                          </td>
                          <td className="border py-2 px-3 text-center">
                            {item.eigen.toFixed(5)}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div className="border rounded flex flex-row"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <div className="flex flex-col border border-white rounded-md shadow mt-4">
            <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
              <BsTable />
              <p className="font-semibold">5 Laptop terburuk</p>
            </div>
            <div className="flex flex-col py-4 px-6 bg-white">
              <div className="mb-4">
                <table className="w-full border">
                  <thead className="bg-azure-100 text-azure-700">
                    <tr>
                      <th className="w-1/12 border py-2 px-3">No</th>
                      <th className="w-8/12 border py-2 px-3">Nama Kriteria</th>
                      <th className="border py-2 px-3">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terburuk?.data.map((item, index) => (
                      <>
                        <tr key={item._id}>
                          <td className="w-1/12 border py-2 px-3 text-center">
                            {index + 1}
                          </td>
                          <td className="w-8/12 border py-2 px-3">
                            {item.name}
                          </td>
                          <td className="border py-2 px-3 text-center">
                            {item.eigen.toFixed(5)}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div className="border rounded flex flex-row"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
