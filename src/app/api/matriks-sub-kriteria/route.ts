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

    const kriteria: FormDataEntryValue =
      (formData.get("kriteria") as string) || "";

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

    const data = await client
      .db(process.env.DB_NAME)
      .collection("matriksSubKriteria")
      .findOne({ kriteria: kriteria });

    return Response.json(
      {
        status: "success",
        message: "Data fetched",
        data,
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
