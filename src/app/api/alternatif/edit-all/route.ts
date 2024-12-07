import calculateEigen from "@/libs/calculateEigen";
import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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

export async function POST() {
  try {
    await client.connect();

    const eigenData = await client
      .db(process.env.DB_NAME)
      .collection("eigen")
      .findOne({
        lingkungan: "laptop",
      });

    if (!eigenData) {
      return Response.json(
        {
          status: "error",
          message: "Data eigen tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const allData = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .find({})
      .toArray();

    if (allData.length === 0) {
      return Response.json(
        {
          status: "error",
          message: "Tidak ada data untuk diperbarui",
        },
        {
          status: 404,
        }
      );
    }

    const updates = allData.map(item => {
      const updatedEigen = calculateEigen(
        eigenData as EigenType,
        item.kriteria
      );
      return {
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              eigen: updatedEigen,
            },
          },
        },
      };
    });

    const result = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .bulkWrite(updates);

    return Response.json(
      {
        status: "success",
        message: "Semua data berhasil diperbarui",
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof MongoServerError) {
      return Response.json(
        {
          status: "error",
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else if (error instanceof Error) {
      return Response.json(
        {
          status: "error",
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }
  }
}
