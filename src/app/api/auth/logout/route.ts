import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";
import { cookies } from "next/headers";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function DELETE() {
  try {
    const refreshToken = cookies().get("refreshToken");

    const data = await client
      .db(process.env.DB_NAME)
      .collection("user")
      .find({
        refreshToken: refreshToken?.value,
      })
      .toArray();

    if (data.length === 0) {
      return Response.json(
        {
          status: "error",
          message: "Token tidak ditemukan",
        },
        {
          status: 401,
        }
      );
    }

    const _id = data[0]._id;
    await client
      .db(process.env.DB_NAME)
      .collection("user")
      .updateOne(
        { _id: _id },
        {
          $set: {
            refreshToken: "",
          },
        }
      );

    cookies().set("refreshToken", "", {
      httpOnly: true,
      maxAge: -1,
      path: "/",
    });

    return Response.json(
      {
        status: "success",
        message: "Berhasil logout",
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
