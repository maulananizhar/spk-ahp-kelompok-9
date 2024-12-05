interface AlternatifType {
  name: string;
  kriteria: { [kriteria: string]: string };
}

export default function AlternatifTable({
  alternatif,
}: {
  alternatif: AlternatifType[];
}) {
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
            <th className="w-2/12 border py-2 px-3">Aksi</th>
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
                      deleteData(item.name);
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
