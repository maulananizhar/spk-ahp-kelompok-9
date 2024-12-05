import {
  MongoClient,
  MongoServerError,
  ObjectId,
  ServerApiVersion,
} from "mongodb";

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

    const eigen: FormDataEntryValue = (formData.get("eigen") as string) || "";

    if (eigen === null || eigen === "") {
      return Response.json(
        {
          status: "error",
          message: "Eigen tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("eigen")
      .updateOne(
        {
          lingkungan: "laptop",
        },
        {
          $set: {
            kriteria: JSON.parse(eigen).kriteria,
            subKriteria: JSON.parse(eigen).subKriteria,
          },
        },
        {
          upsert: false,
        }
      );

    return Response.json(
      {
        status: "success",
        message: "Data berhasil diubah",
        mongodb: mongodb,
        data: JSON.parse(eigen),
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
