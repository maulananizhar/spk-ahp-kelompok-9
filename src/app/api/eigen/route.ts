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

export async function GET() {
  try {
    await client.connect();

    const mongodb = await client
      .db(process.env.DB_NAME)
      .collection("eigen")
      .findOne({
        _id: new ObjectId("674ca2e1bd8e2e7ec4121464"),
      });

    return Response.json(
      {
        status: "success",
        message: "Data berhasil diubah",
        data: mongodb,
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
