import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const client = new MongoClient(process.env.MONGODB_URL || "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const username: FormDataEntryValue =
      (formData.get("username") as string) || "";
    const password: FormDataEntryValue =
      (formData.get("password") as string) || "";

    if (username === null || username === "") {
      return Response.json(
        {
          status: "error",
          message: "Username tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    if (password === null || password === "") {
      return Response.json(
        {
          status: "error",
          message: "Password tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          status: "error",
          message: "Password minimal 8 karakter",
        },
        {
          status: 400,
        }
      );
    }

    if (!validator.isAlphanumeric(username)) {
      return Response.json(
        {
          status: "error",
          message: "Username hanya boleh berisi huruf dan angka",
        },
        {
          status: 400,
        }
      );
    }

    const data = await client
      .db(process.env.DB_NAME)
      .collection("user")
      .find({ username: username })
      .toArray();

    if (data.length === 0) {
      return Response.json(
        {
          status: "error",
          message: "Username tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    const isMatch = await bcrypt.compare(password, data[0].password);
    if (!isMatch) {
      return Response.json(
        {
          status: "error",
          message: "Password salah",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = jwt.sign(
      {
        _id: data[0]._id,
        username: data[0].username,
        role: data[0].role,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "30s" }
    );

    const refreshToken = jwt.sign(
      {
        _id: data[0]._id,
        username: data[0].username,
        role: data[0].role,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "1d" }
    );

    await client
      .db(process.env.DB_NAME)
      .collection("user")
      .updateOne(
        { _id: data[0]._id },
        {
          $set: {
            refreshToken: refreshToken,
          },
        }
      );

    cookies().set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    });

    return Response.json(
      {
        status: "success",
        message: "Berhasil login",
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
