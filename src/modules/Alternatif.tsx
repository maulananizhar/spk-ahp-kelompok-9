import { BsBox, BsPlus, BsTable } from "react-icons/bs";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "rsuite/Slider/styles/index.css";
import "rsuite/RangeSlider/styles/index.css";
import toast, { Toaster } from "react-hot-toast";
import { Mosaic } from "react-loading-indicators";
import AlternatifTable from "@/components/AlternatifTable";

type APIType = {
  status: string;
  data: AlternatifType[];
};

interface AlternatifType {
  name: string;
  kriteria: { [kriteria: string]: string };
}

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    width: "30%",
    height: "50%",
    margin: "auto",
    padding: "0rem",
    inset: "0",
    border: "0",
    borderRadius: "0.5rem",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
};

export default function Alternatif() {
  const [data, setData] = useState<APIType>();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [kriteria, setKriteria] = useState<{ [kriteria: string]: string }>();
  const [oldName, setOldName] = useState("");
  const [modalInfo, setModalInfo] = useState("Isilah form di bawah ini!");

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setModalInfo("Isilah form di bawah ini!");
    setName("");
  };

  async function fetchData() {
    const res = await axios.get(`/api/alternatif`);
    setData(res.data);
    setLoading(false);
  }

  async function addData(
    name: string,
    kriteria: { [kriteria: string]: string },
    e: FormEvent
  ) {
    try {
      e.preventDefault();
      await axios.post(
        `/api/alternatif/add`,
        {
          name: name,
          kriteria: JSON.stringify(kriteria),
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      closeModal();
      fetchData();
      notifyAddData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setModalInfo(err.response?.data.message);
      }
    }
  }

  async function editData(
    kriteria: string,
    name: string,
    oldName: string,
    e: FormEvent
  ) {
    try {
      e.preventDefault();
      await axios.post(
        `/api/alternatif/edit`,
        {
          kriteria: kriteria,
          name: name,
          oldName: oldName,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      closeModal();
      fetchData();
      notifyEditData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setModalInfo(err.response?.data.message);
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const notifyAddData = () => toast.success("Kriteria berhasil ditambahkan!");
  const notifyEditData = () => toast.success("Kriteria berhasil diubah!");

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
      <Toaster
        position="bottom-right"
        toastOptions={{
          success: {
            iconTheme: {
              primary: "#1242A2",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#D93C3E",
              secondary: "#fff",
            },
          },
        }}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        ariaHideApp={false}>
        <div className="w-full h-full bg-white flex flex-col">
          <div className="flex px-4 py-8 flex-row border h-10 items-center">
            <p className="text-2xl font-semibold">
              {action === "add" ? "Tambah Kriteria" : "Edit Kriteria"}
            </p>
          </div>
          <div
            className={`mx-6 my-6 px-4 py-4 border ${
              modalInfo === "Isilah form di bawah ini!"
                ? "border-azure-200 bg-azure-100 text-azure-800"
                : "border-red-200 bg-red-100 text-red-800"
            }`}>
            <p>{modalInfo}</p>
          </div>
          <div>
            <form
              className="mx-12"
              onSubmit={e => {
                if (action === "add") addData(name, kriteria || {}, e);
                if (action === "edit") editData(name, kriteria, oldName, e);
              }}>
              {data?.data[0].kriteria && (
                <>
                  {Object.keys(data?.data[0].kriteria).map(
                    (kriteria, index) => (
                      <div className="flex flex-col" key={index}>
                        <label
                          htmlFor={kriteria}
                          className="text-sm font-semibold">
                          {kriteria.charAt(0).toUpperCase() + kriteria.slice(1)}
                        </label>
                        <input
                          type="text"
                          name={kriteria}
                          id={kriteria}
                          className="border rounded px-2 py-1 mb-4"
                          value={kriteria}
                        />
                      </div>
                    )
                  )}
                </>
              )}
              {/* <div className="flex flex-col">
                <label htmlFor="lingkungan" className="text-sm font-semibold">
                  Lingkungan
                </label>
                <input
                  type="text"
                  name="lingkungan"
                  id="lingkungan"
                  className="border rounded px-2 py-1 mb-4"
                  disabled
                  value={"Sistem Pendukung Keputusan Laptop Terbaik"}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-semibold">
                  Nama Kriteria
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="border rounded px-2 py-1 mb-6"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div> */}
              <button
                type="submit"
                className="w-full bg-azure-200 py-2 rounded shadow active:scale-105 duration-150">
                {action === "add" ? "Tambah" : "Edit"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center text-3xl gap-4">
            <BsBox />
            <p className="font-semibold">Alternatif</p>
          </div>
          <div>
            <button
              className="bg-azure-700 text-white pl-2 pr-3 py-1 flex items-center flex-row rounded-md active:scale-105 duration-150"
              onClick={() => {
                setAction("add");
                openModal();
              }}>
              <BsPlus className="text-2xl stroke-[0.7]" />
              <p>Tambah Alternatif</p>
            </button>
          </div>
        </div>
        <div className="flex flex-col border border-white rounded-md shadow mt-8">
          <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
            <BsTable />
            <p className="font-semibold">Daftar Alternatif</p>
          </div>
          <div className="flex flex-col py-4 px-6 bg-white">
            <div className="flex flex-row justify-between mb-4">
              <div className="flex flex-row items-center gap-2">
                <p>Pilih Kriteria : </p>
              </div>
              <div className="flex flex-row items-center">
                <p>Search :</p>
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="harga..."
                  className="ml-2 border rounded border-gray-200 px-2 py-1"
                />
              </div>
            </div>
            <div className="mb-4">
              <AlternatifTable alternatif={data?.data || []} />
            </div>
            <div className="flex flex-row justify-between items-center">
              <div>
                <p>
                  Menampilkan 1 s/d {data?.data.length} dari {data?.data.length}{" "}
                  kriteria
                </p>
              </div>
              <div className="border rounded flex flex-row"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
