import { matrixConverter } from "@/libs/matrixConverter";
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

    // const oldData = await client
    //   .db(process.env.DB_NAME)
    //   .collection("kriteria")
    //   .find({ name: formData.get("name") })
    //   .toArray();

    // Validation for empty data
    const kriteria1: FormDataEntryValue =
      (formData.get("kriteria1") as string) || "";
    const kriteria2: FormDataEntryValue =
      (formData.get("kriteria2") as string) || "";
    const value: FormDataEntryValue = (formData.get("value") as string) || "";

    if (kriteria1 === null || kriteria1 === "") {
      return Response.json(
        {
          status: "error",
          message: "Kriteria 1 tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }
    if (kriteria2 === null || kriteria2 === "") {
      return Response.json(
        {
          status: "error",
          message: "Kriteria 2 tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }
    if (value === null || value === "") {
      return Response.json(
        {
          status: "error",
          message: "Value tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    // Update data to MongoDB
    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("matriksKriteria")
      .updateOne(
        {
          lingkungan: "laptop",
          "intensity.kriteria1": formData.get("kriteria1"),
          "intensity.kriteria2": formData.get("kriteria2"),
        },
        {
          $set: {
            "intensity.$.intensity": matrixConverter(
              Number(formData.get("value"))
            ),
          },
        }
      );

    return Response.json(
      {
        status: "success",
        message: "Data added",
        mongodb,
        data: {
          kriteria1: formData.get("kriteria1"),
          kriteria2: formData.get("kriteria2"),
          value: matrixConverter(Number(formData.get("value"))),
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
