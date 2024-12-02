import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function DELETE(req: Request) {
  try {
    await client.connect();

    const formData = await req.formData();

    const name: FormDataEntryValue = (formData.get("name") as string) || "";

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

    const oldData = await client
      .db(process.env.DB_NAME)
      .collection("kriteria")
      .find({ name: name })
      .toArray();

    if (oldData.length === 0) {
      return Response.json(
        {
          status: "error",
          message: "Data not found",
        },
        {
          status: 404,
        }
      );
    }

    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("kriteria")
      .deleteOne({ name: name });

    return Response.json(
      {
        status: "success",
        message: "Data deleted",
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
