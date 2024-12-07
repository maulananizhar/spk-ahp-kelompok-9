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

export async function POST(req: Request) {
  try {
    await client.connect();

    const formData = await req.formData();

    const name: FormDataEntryValue = (formData.get("name") as string) || "";
    const oldName: FormDataEntryValue =
      (formData.get("oldName") as string) || "";
    const kriteria: FormDataEntryValue =
      (formData.get("kriteria") as string) || "";

    if (name === null || name === "") {
      return Response.json(
        {
          status: "error",
          message: "Name tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    if (oldName === null || oldName === "") {
      return Response.json(
        {
          status: "error",
          message: "Name tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    for (const key in JSON.parse(kriteria)) {
      if (JSON.parse(kriteria)[key] === "") {
        return Response.json(
          {
            status: "error",
            message: "Bobot kriteria tidak boleh kosong",
          },
          {
            status: 400,
          }
        );
      }
    }

    const oldData = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .find({ name: formData.get("name") })
      .toArray();

    // Validation for duplicate data
    if (oldData.length > 0 && name !== oldName) {
      return Response.json(
        {
          status: "error",
          message: "Data sudah ada",
        },
        {
          status: 400,
        }
      );
    }

    const eigen = await client
      .db(process.env.DB_NAME)
      .collection("eigen")
      .findOne({
        lingkungan: "laptop",
      });

    if (!eigen) {
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

    const total = calculateEigen(eigen as EigenType, JSON.parse(kriteria));

    // Update data to MongoDB
    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .updateOne(
        { name: oldName },
        {
          $set: {
            name: name,
            kriteria: JSON.parse(kriteria),
            eigen: total,
          },
        }
      );

    return Response.json(
      {
        status: "success",
        message: "Data added",
        mongodb,
        data: {
          name: name,
          kriteria: JSON.parse(kriteria),
          eigen: total,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // Handle error
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
