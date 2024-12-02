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

    const pair: FormDataEntryValue = (formData.get("pair") as string) || "";

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

    if (pair === null || pair === "") {
      return Response.json(
        {
          status: "error",
          message: "Pair tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    // Update data to MongoDB
    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("matriksSubKriteria")
      .updateOne(
        {
          kriteria: kriteria,
        },
        {
          $set: {
            pair: JSON.parse(pair),
          },
        },
        {
          upsert: true,
        }
      );

    return Response.json(
      {
        status: "success",
        message: "Data added",
        mongodb,
        data: JSON.parse(pair),
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
