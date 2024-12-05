import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function POST(req: Request) {
  try {
    await client.connect();

    const formData = await req.formData();

    const name: FormDataEntryValue = (formData.get("name") as string) || "";
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

    if (kriteria === null || kriteria === "") {
      return Response.json(
        {
          status: "error",
          message: "Kriteria tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    const oldData = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .find({ name: { $regex: name, $options: "i" } })
      .toArray();

    // Validation for duplicate data
    if (oldData.length > 0) {
      return Response.json(
        {
          status: "error",
          message: "Data sudah tersedia",
        },
        {
          status: 400,
        }
      );
    }

    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .insertOne({
        name: name,
        kriteria: kriteria,
      });

    return Response.json(
      {
        status: "success",
        message: "Data berhasil ditambahkan",
        mongodb,
        data: {
          name: name,
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
