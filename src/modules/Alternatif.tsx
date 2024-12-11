import {
  BsBox,
  BsCaretLeftFill,
  BsCaretRightFill,
  BsPlus,
  BsTable,
} from "react-icons/bs";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "rsuite/Slider/styles/index.css";
import "rsuite/RangeSlider/styles/index.css";
import toast, { Toaster } from "react-hot-toast";
import { Mosaic } from "react-loading-indicators";
import AlternatifTable from "@/components/AlternatifTable";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/services/storage";
import { RefreshType } from "@/types/RefreshType";
import { PayloadToken } from "@/types/PayloadToken";
import jwt from "jsonwebtoken";

type APIType = {
  status: string;
  data: AlternatifType[];
  message: string;
  length: number;
};

interface OptionData {
  _id: string;
  kriteria: string;
  name: string;
}

interface AlternatifType {
  _id: string;
  name: string;
  kriteria: { [kriteria: string]: string };
  eigen: number;
}

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    width: "30%",
    height: "40rem",
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
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [data, setData] = useState<APIType>();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [oldName, setOldName] = useState("");
  const [optionData, setOptionData] = useState<OptionData[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const [modalInfo, setModalInfo] = useState("Isilah form di bawah ini!");
  const [sort, setSort] = useState("data-terbaru");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

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
        fetchData().then(() => setLoading(false));
      }
    } catch {
      router.push("/auth/login");
    }
  }

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setModalInfo("Isilah form di bawah ini!");
    setName("");
    setFormValues(() => {
      const initialValues = Array.from(
        new Set(optionData.map(item => item.kriteria))
      ).reduce<Record<string, string>>(
        (acc, kriteria) => ({ ...acc, [kriteria]: "" }),
        {}
      );
      return initialValues;
    });
  };

  async function fetchData() {
    const res = await axios.post(
      `/api/alternatif`,
      {
        sort: sort,
        page: page,
        limit: 100,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    setData(res.data);
  }

  async function fetchOptionData() {
    const res = await axios.get(`/api/sub-kriteria/all`);
    setOptionData(res.data.data);

    const initialValues = Array.from(
      new Set(optionData.map((item: OptionData) => item.kriteria))
    ).reduce<Record<string, string>>(
      (acc, kriteria) => ({ ...acc, [kriteria]: "" }),
      {}
    );
    setFormValues(initialValues);
  }

  async function addData(
    name: string,
    kriteria: Record<string, string>,
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
    name: string,
    oldName: string,
    kriteria: Record<string, string>,
    e: FormEvent
  ) {
    try {
      e.preventDefault();
      await axios.post(
        `/api/alternatif/edit`,
        {
          name: name,
          oldName: oldName,
          kriteria: JSON.stringify(kriteria),
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

  const handleOptionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchOptionData();
    refreshToken();
  }, []);

  useEffect(() => {
    fetchData();
  }, [sort, page]);

  useEffect(() => {
    if (data) setMaxPage(Math.ceil(data?.length / 100));
  }, [data]);

  const notifyAddData = () => toast.success("Alternatif berhasil ditambahkan!");
  const notifyEditData = () => toast.success("Alternatif berhasil diubah!");

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
              {action === "add" ? "Tambah Alternatif" : "Edit Alternatif"}
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
                if (action === "add") addData(name, formValues, e);
                if (action === "edit") editData(name, oldName, formValues, e);
              }}>
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-semibold">
                  Nama Alternatif
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="border rounded px-2 py-1 mb-6"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              {Object.keys(formValues).map(kriteria => (
                <div className="flex flex-col" key={kriteria}>
                  <label htmlFor={kriteria} className="text-sm font-semibold">
                    {kriteria}
                  </label>
                  <select
                    id={kriteria}
                    name={kriteria}
                    value={formValues[kriteria]}
                    onChange={handleOptionChange}
                    className="border rounded px-2 py-1 mb-6">
                    <option value="" hidden>
                      -- Pilih {kriteria} --
                    </option>
                    {optionData
                      .filter(item => item.kriteria === kriteria)
                      .map(option => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
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
              className="bg-azure-700 text-white pl-2 pr-3 py-1 flex items-center flex-row rounded-md active:scale-105 duration-150 disabled:hidden"
              onClick={() => {
                setAction("add");
                openModal();
              }}
              disabled={auth.role == "user" ? true : false}>
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
                <select
                  name="sorter"
                  id="sorter"
                  className="bg-azure-700 text-white text-sm font-medium pt-2 pb-3 pl-2 pr-3 border-r-[8px] border-r-azure-700 flex items-center flex-row rounded-md active:scale-105 duration-150"
                  value={sort}
                  onChange={e => setSort(e.target.value)}>
                  <option className="bg-white text-black" value="data-terbaru">
                    Data terbaru
                  </option>
                  <option className="bg-white text-black" value="data-terlama">
                    Data terlama
                  </option>
                  <option className="bg-white text-black" value="nama-asc">
                    Nama ascending
                  </option>
                  <option className="bg-white text-black" value="nama-desc">
                    Nama descending
                  </option>
                  <option
                    className="bg-white text-black"
                    value="laptop-terbaik">
                    Laptop terbaik
                  </option>
                  <option
                    className="bg-white text-black"
                    value="laptop-terburuk">
                    Laptop terburuk
                  </option>
                </select>
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
              <AlternatifTable
                alternatif={data?.data || []}
                fetchData={fetchData}
                openModal={openModal}
                setAction={setAction}
                setName={setName}
                setOldName={setOldName}
              />
            </div>
            <div className="flex flex-row justify-between items-center">
              <div>
                <p>
                  Menampilkan 1 s/d{" "}
                  {data?.data?.length && data.data.length < 100
                    ? data.data.length
                    : 100}{" "}
                  dari {data?.length} kriteria
                </p>
              </div>
              <div className="flex flex-row">
                <button
                  className="uppercase border border-azure-800 rounded px-1 py-0.5 text-azure-800 font-bold active:scale-105 duration-150"
                  onClick={() => {
                    if (page == 1) return setPage(1);
                    setPage(page - 1);
                  }}>
                  <BsCaretLeftFill />
                </button>
                <p className="mx-2 px-2 py-0.5 border border-azure-800 rounded">
                  {page}
                </p>
                <button
                  className="uppercase border border-azure-800 rounded px-1 py-0.5 text-azure-800 font-bold active:scale-105 duration-150"
                  onClick={() => {
                    if (page == maxPage) return setPage(maxPage);
                    setPage(page + 1);
                  }}>
                  <BsCaretRightFill />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
