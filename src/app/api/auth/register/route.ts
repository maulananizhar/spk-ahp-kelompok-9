import { MongoClient, MongoServerError, ServerApiVersion } from "mongodb";
import bcrypt from "bcrypt";
import validator from "validator";

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
    const confirmPassword: FormDataEntryValue =
      (formData.get("confirmPassword") as string) || "";

    const hash = await bcrypt.hash(password, 10);

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

    if (confirmPassword === null || confirmPassword === "") {
      return Response.json(
        {
          status: "error",
          message: "Konfirmasi password tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        {
          status: "error",
          message: "Password dan konfirmasi password tidak sama",
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

    const duplicatedUsername = await client
      .db(process.env.DB_NAME)
      .collection("user")
      .find({ username: username })
      .toArray();

    if (duplicatedUsername.length > 0) {
      return Response.json(
        {
          status: "error",
          message: "Username sudah digunakan",
        },
        {
          status: 400,
        }
      );
    }

    const data = await client
      .db(process.env.DB_NAME)
      .collection("user")
      .insertOne({
        username: username,
        password: hash,
        role: "user",
        refreshToken: "",
      });

    return Response.json(
      {
        status: "success",
        message: "User berhasil dibuat",
        data: data,
      },
      {
        status: 201,
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
