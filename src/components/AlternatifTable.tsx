"use client";

import { AuthContext } from "@/services/storage";
import axios from "axios";
import { useContext } from "react";
import toast from "react-hot-toast";

interface AlternatifType {
  _id: string;
  name: string;
  kriteria: { [kriteria: string]: string };
  eigen: number;
}

export default function AlternatifTable({
  alternatif,
  setName,
  setOldName,
  setAction,
  openModal,
  fetchData,
}: {
  alternatif: AlternatifType[];
  setName: (name: string) => void;
  setOldName: (name: string) => void;
  setAction: (action: string) => void;
  openModal: () => void;
  fetchData: () => void;
}) {
  const auth = useContext(AuthContext);

  async function deleteData(id: string) {
    await axios.delete(`/api/alternatif/delete`, {
      data: { id: id },
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchData();
  }

  const notifyDeleteData = () => toast.error("Alternatif berhasil dihapus!");

  return (
    <>
      <table className="w-full border">
        <thead className="bg-azure-100 text-azure-700">
          <tr>
            <th className="w-1/12 border py-2 px-3">No</th>
            <th className="border py-2 px-3">Nama</th>
            {alternatif[0].kriteria && (
              <>
                {Object.keys(alternatif[0].kriteria).map((kriteria, index) => (
                  <th key={index} className="border py-2 px-3">
                    {kriteria.charAt(0).toUpperCase() + kriteria.slice(1)}
                  </th>
                ))}
              </>
            )}
            <th className="w-1/12 border py-2 px-3">Skor</th>
            <th
              className={`w-2/12 border py-2 px-3 ${
                auth.role == "user" ? "hidden" : ""
              }`}>
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {alternatif.map((item, index) => (
            <tr key={index}>
              <td className="w-1/12 border py-2 px-3 text-center">
                {index + 1}
              </td>
              <td className="border py-2 px-3">{item.name}</td>
              {Object.values(item.kriteria).map((value, index) => (
                <td key={index} className="border py-2 px-3 text-center">
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </td>
              ))}
              <td className="w-1/12 text-center border py-2 px-3">
                {item.eigen.toFixed(5)}
              </td>
              <td
                className={`w-2/12 border py-2 px-3 
                ${auth.role == "user" ? "hidden" : ""}`}>
                <div className="flex flex-row justify-evenly text-center">
                  <button
                    className="uppercase text-xs border border-azure-800 rounded px-2 py-1 text-azure-800 font-bold active:scale-105 duration-150"
                    onClick={() => {
                      setAction("edit");
                      setOldName(item.name);
                      setName(item.name);
                      openModal();
                    }}>
                    Edit
                  </button>
                  <button
                    className="uppercase text-xs border border-red-500 rounded px-2 py-1 bg-red-100 text-red-500 font-bold active:scale-105 duration-150"
                    onClick={() => {
                      deleteData(item._id);
                      notifyDeleteData();
                    }}>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
