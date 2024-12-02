import axios from "axios";
import toast from "react-hot-toast";

export default function SubKriteriaTable({
  item,
  index,
  kriteria,
  setAction,
  setOldName,
  setName,
  openModal,
  fetchData,
  initPair,
  deleteLambda,
}: {
  item: { name: string; _id: string };
  index: number;
  kriteria: string;
  setAction: (action: string) => void;
  setOldName: (name: string) => void;
  setName: (name: string) => void;
  openModal: () => void;
  fetchData: () => void;
  initPair: () => void;
  deleteLambda: () => void;
}) {
  async function deleteData(kriteria: string, name: string) {
    await axios.delete(`/api/sub-kriteria/delete`, {
      data: { kriteria: kriteria, name: name },
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchData();
    initPair();
    deleteLambda();
  }

  const notifyDeleteData = () => toast.error("Kriteria berhasil dihapus!");

  return (
    <>
      <tr key={item._id}>
        <td className="w-1/12 border py-2 px-3 text-center">{index + 1}</td>
        <td className="w-8/12 border py-2 px-3">{item.name}</td>
        <td className="w-2/12 border py-2 px-3">
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
                deleteData(kriteria, item.name);
                notifyDeleteData();
              }}>
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
