import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function POST() {
  try {
    const refreshToken = cookies().get("refreshToken");

    if (!refreshToken) {
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

    const data = await client
      .db(process.env.DB_NAME)
      .collection("user")
      .find({
        refreshToken: refreshToken.value,
      })
      .toArray();

    if (data.length === 0) {
      cookies().set("refreshToken", "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
      });

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

    jwt.verify(
      refreshToken.value,
      process.env.REFRESH_TOKEN_SECRET || "",
      error => {
        if (error) {
          cookies().set("refreshToken", "", {
            httpOnly: true,
            maxAge: 0,
            path: "/",
          });

          return Response.json(
            {
              status: "error",
              message: "Token telah diubah",
            },
            {
              status: 401,
            }
          );
        }
      }
    );

    const accessToken = jwt.sign(
      {
        _id: data[0]._id,
        username: data[0].username,
        role: data[0].role,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "30s" }
    );

    return Response.json(
      {
        status: "success",
        message: "Berhasil refresh token",
        accessToken: accessToken,
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
