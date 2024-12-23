import { BsBox, BsCalculator, BsFloppy, BsPlus, BsTable } from "react-icons/bs";
import { FormEvent, useContext, useEffect, useState } from "react";
import axios from "axios";
import { KriteriaType } from "@/types/KriteriaType";
import Modal from "react-modal";
import "rsuite/Slider/styles/index.css";
import "rsuite/RangeSlider/styles/index.css";
import KriteriaSlider from "@/components/KriteriaSlider";
import KriteriaTable from "@/components/KriteriaTable";
import { matrixConverter } from "@/libs/matrixConverter";
import toast, { Toaster } from "react-hot-toast";
import { transformMatrix } from "@/libs/transformMatrix";
import { normalizationMatrix } from "@/libs/normalizationMatrix";
import { processMatrix } from "@/libs/processMatrix";
import { calculateLambda } from "@/libs/calculateLambda";
import { riGenerate } from "@/libs/riGenerate";
import { getEigenValue } from "@/libs/getEigenValue";
import { Mosaic } from "react-loading-indicators";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/services/storage";
import jwt from "jsonwebtoken";
import { RefreshType } from "@/types/RefreshType";
import { PayloadToken } from "@/types/PayloadToken";

type APIType = {
  status: string;
  data: KriteriaType[];
};

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

export default function Kriteria({
  changeKriteriaEigen,
}: {
  changeKriteriaEigen: (data: { [kriteria: string]: number }) => void;
}) {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [data, setData] = useState<APIType>();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [oldName, setOldName] = useState("");
  const [modalInfo, setModalInfo] = useState("Isilah form di bawah ini!");
  const [pair, setPair] = useState<
    {
      kriteria1: string;
      kriteria2: string;
      intensitas: number;
      value: number;
    }[]
  >([]);

  const [matrix, setMatrix] = useState<(string | number)[][]>();
  const [normalization, setNormalization] = useState<(string | number)[][]>();
  const [eigen, setEigen] = useState<(string | number)[][]>();
  const [lambda, setLambda] = useState<(string | number)[]>();

  const [CI, setCI] = useState<string | number>(0);
  const [RI, setRI] = useState<number>(0);
  const [CR, setCR] = useState<string | number>(0);

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
        fetchData()
          .then(() => fetchPair())
          .then(() => setLoading(false));
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
  };

  async function fetchData() {
    const res = await axios.post(
      `/api/kriteria`,
      {},
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setData(res.data);
  }

  async function initPair() {
    const res = await axios.post(
      `/api/kriteria`,
      {
        lingkungan: "laptop",
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    const raw = [];
    const pair = [];
    for (let i = 0; i < res.data.data.length; i++) {
      raw.push(res.data.data[i].name);
    }

    for (let i = 0; i < raw.length; i++) {
      for (let j = i + 1; j < raw.length; j++) {
        pair.push({
          kriteria1: raw[i],
          kriteria2: raw[j],
          intensitas: matrixConverter(8),
          value: 8,
        });
      }
    }

    setPair(pair);
    addPair(pair);
  }

  async function changePair(
    kriteria1: string,
    kriteria2: string,
    intensitas: number,
    value: number
  ) {
    // change one array if kriteria1 and kriteria 2 is the same
    const newPair = pair?.map(item => {
      if (item.kriteria1 === kriteria1 && item.kriteria2 === kriteria2) {
        return { ...item, intensitas, value };
      }
      return item;
    });
    setPair(newPair);
  }

  async function addPair(
    pair: {
      kriteria1: string;
      kriteria2: string;
      intensitas: number;
      value: number;
    }[]
  ) {
    try {
      await axios.post(
        `/api/matriks-kriteria/add`,
        {
          pair: JSON.stringify(pair),
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data.message);
      }
    }
  }

  async function fetchPair() {
    const res = await axios.get(`/api/matriks-kriteria`);
    if (res.data.data.pair != null) {
      setPair(res.data.data.pair);
      return;
    } else {
      initPair();
    }
  }

  async function addData(name: string, e: FormEvent) {
    try {
      e.preventDefault();
      await axios.post(
        `/api/kriteria/add`,
        {
          name: name,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      closeModal();
      fetchData();
      initPair();
      notifyAddData();
      deleteLambda();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setModalInfo(err.response?.data.message);
      }
    }
  }

  async function editData(oldName: string, name: string, e: FormEvent) {
    try {
      e.preventDefault();
      await axios.post(
        `/api/kriteria/edit`,
        {
          oldName: oldName,
          name: name,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      closeModal();
      fetchData();
      notifyEditData();
      initPair();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setModalInfo(err.response?.data.message);
      }
    }
  }

  function deleteLambda() {
    setLambda([]);
  }

  useEffect(() => {
    refreshToken();
  }, []);

  // useEffect(() => {
  //   if (data) {
  // initPair();
  // console.log("woke");
  //   }
  // }, [data]);

  useEffect(() => {
    // if (pair && pair.length > 0 && data) {
    //   setLoading(false);
    // }
    // if ((data?.data?.length ?? 0) < 1) {
    //   setLoading(false);
    // }

    const timeout = setTimeout(() => {
      setMatrix(transformMatrix(pair || []));
      setLambda([]);
      setCI(0);
      setRI(0);
      setCR(0);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pair]);

  useEffect(() => {
    setNormalization(normalizationMatrix(matrix || []));
  }, [matrix]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEigen(processMatrix(normalization || []));
      if (normalization?.length !== 0) {
        addPair(pair);
        notifyUpdatePair();
        setLambda(
          calculateLambda(processMatrix(normalization || []), matrix || [])
        );
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [normalization]);

  useEffect(() => {
    setCI(
      lambda
        ? (
            (Number(lambda[lambda.length - 1]) - (data?.data?.length || 0)) /
            ((data?.data?.length || 1) - 1)
          ).toFixed(3)
        : 0
    );
    setRI(riGenerate(data?.data?.length || 0));
  }, [lambda]);

  useEffect(() => {
    setCR((Number(CI) / RI).toFixed(3));
  }, [CI, RI]);

  const notifyAddData = () => toast.success("Kriteria berhasil ditambahkan!");
  const notifyEditData = () => toast.success("Kriteria berhasil diubah!");
  const notifyUpdatePair = () => toast.success("Matriks berhasil diupdate!");

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
                if (action === "add") addData(name, e);
                if (action === "edit") editData(oldName, name, e);
              }}>
              <div className="flex flex-col">
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
              </div>
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
            <p className="font-semibold">Kriteria</p>
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
              <p>Tambah Kriteria</p>
            </button>
          </div>
        </div>
        <div className="flex flex-col border border-white rounded-md shadow mt-8">
          <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
            <BsTable />
            <p className="font-semibold">Daftar Kriteria</p>
          </div>
          <div className="flex flex-col py-4 px-6 bg-white">
            <div className="flex flex-row justify-between mb-4">
              <div className="flex flex-row items-center gap-2"></div>
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
              <table className="w-full border">
                <thead className="bg-azure-100 text-azure-700">
                  <tr>
                    <th className="w-1/12 border py-2 px-3">No</th>
                    <th className="w-8/12 border py-2 px-3">Nama Kriteria</th>
                    <th
                      className={`w-2/12 border py-2 px-3  ${
                        auth.role == "user" ? "hidden" : ""
                      }`}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((item, index) => (
                    <KriteriaTable
                      key={index}
                      item={item}
                      index={index}
                      setAction={setAction}
                      setOldName={setOldName}
                      setName={setName}
                      openModal={openModal}
                      fetchData={fetchData}
                      initPair={initPair}
                      deleteLambda={deleteLambda}
                    />
                  ))}
                </tbody>
              </table>
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

        <div className="flex flex-row justify-between items-center mt-8">
          <div className="flex flex-row items-center text-3xl gap-4">
            <BsBox />
            <p className="font-semibold">Perbandingan Kriteria</p>
          </div>
          <div></div>
        </div>

        <div>
          {pair?.map((item, index) => (
            <div key={index}>
              <KriteriaSlider
                kriteria1={item.kriteria1}
                kriteria2={item.kriteria2}
                rawValue={item.value}
                changePair={changePair}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-between items-center mt-8">
          <div className="flex flex-row items-center text-3xl gap-4">
            <BsCalculator />
            <p className="font-semibold">Perhitungan Kriteria</p>
          </div>
          <div>
            <button
              className="bg-azure-700 text-white px-3 py-1 flex items-center flex-row rounded-md active:scale-105 duration-150 disabled:hidden"
              onClick={() => {
                if (lambda?.length == 0) {
                  toast.error("Data perbandingan belum disimpan!");
                } else if (Number(CR) > 0.1) {
                  toast.error("Data matriks tidak konsisten!");
                } else {
                  changeKriteriaEigen(
                    getEigenValue(data?.data || [], eigen || [])
                  );
                  toast.success("Eigen Value berhasil disimpan!");
                }
              }}
              disabled={auth.role == "user" ? true : false}>
              <BsFloppy className="mr-2 stroke-[0.2]" />
              <p>Simpan Eigen Value</p>
            </button>
          </div>
        </div>

        <div className="flex flex-col border border-white bg-white rounded-md shadow mt-8">
          <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
            <BsTable />
            <p className="font-semibold">Matriks Kepentingan Kriteria</p>
          </div>
          <div className="flex justify-center mx-8 my-6">
            <table>
              <tbody>
                {matrix?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`border border-black px-4 py-2 ${
                          rowIndex === 0 || cellIndex === 0
                            ? "bg-azure-100"
                            : "text-center"
                        }`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col border border-white bg-white rounded-md shadow mt-8">
          <div className="flex flex-row items-center text-azure-700 py-4 px-6 bg-gray-50 border-b border-gray-100 gap-3">
            <BsTable />
            <p className="font-semibold">Matriks Nilai Kriteria</p>
          </div>
          <div className="flex justify-center mx-8 mt-6 mb-2">
            <table>
              <tbody>
                {normalization?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`border border-black px-4 py-2 ${
                          rowIndex === 0 || cellIndex === 0
                            ? "bg-azure-100"
                            : "text-center"
                        }`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <tbody>
                {eigen?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`border border-black border-l-0 px-4 py-2 text-center ${
                          cellIndex === 0 ? "bg-red-200" : "bg-blue-200"
                        }`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <tbody>
                {lambda?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black border-l-0 bg-lemon-100 px-4 py-2 text-center">
                      {item}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex mb-6 mx-64 justify-center gap-4">
            <p>CI : {CI}</p>
            <p>RI : {RI}</p>
            <p>
              CR : {CR}{" "}
              {Number(CR) <= 0.1 ? (
                <span>
                  {`< 0.1 `}
                  <span className="font-bold">(Konsisten)</span>
                </span>
              ) : (
                <span>
                  {`> 0.1 `}
                  <span className="font-bold">(Tidak Konsisten)</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
