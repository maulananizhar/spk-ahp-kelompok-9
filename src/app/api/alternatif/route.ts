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

    const sort: FormDataEntryValue =
      (formData.get("sort") as string) || "data-terbaru";
    const page: FormDataEntryValue = (formData.get("page") as string) || "1";
    const limit: FormDataEntryValue =
      (formData.get("limit") as string) || "100";

    if (sort === null || sort === "") {
      return Response.json(
        {
          status: "error",
          message: "Sort tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .find()
      .limit(parseInt(limit))
      .sort(
        sort == "data-terbaru"
          ? { _id: -1 }
          : sort == "data-terlama"
          ? { _id: 1 }
          : sort == "nama-asc"
          ? { name: 1 }
          : sort == "nama-desc"
          ? { name: -1 }
          : sort == "laptop-terbaik"
          ? { eigen: -1 }
          : sort == "laptop-terburuk"
          ? { eigen: 1 }
          : { _id: -1 }
      )
      .skip((parseInt(page) - 1) * 100)
      .toArray();

    const length: number = await client
      .db(process.env.DB_NAME)
      .collection("alternatif")
      .find()
      .count();

    return Response.json(
      {
        status: "success",
        message: "Data berhasil ditemukan",
        data: mongodb,
        length: length,
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
