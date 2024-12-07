import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await client.connect();

    const data = await client
      .db(process.env.DB_NAME)
      .collection("subKriteria")
      .find()
      .sort({ _id: 1 })
      .toArray();

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
