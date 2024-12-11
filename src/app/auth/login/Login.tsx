"use client";

import { AuthContext } from "@/services/storage";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useContext, useEffect, useState } from "react";
import { Mosaic } from "react-loading-indicators";
import jwt from "jsonwebtoken";

type PayloadToken = {
  _id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
};

type RefreshType = {
  status: string;
  message: string;
  accessToken: string;
};

export default function Login() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function refreshToken() {
    try {
      const response = await axios.post<RefreshType>(
        "/api/auth/token",
        {},
        {
          withCredentials: true,
        }
      );

      auth.setToken(response.data.accessToken);
      const decoded = jwt.decode(response.data.accessToken) as PayloadToken;

      if (decoded) {
        auth.setId(decoded._id);
        auth.setUsername(decoded.username);
        auth.setRole(decoded.role);
        auth.setExpire(decoded.exp);
        router.push("/");
      }
    } catch {
      setLoading(false);
    }
  }

  async function loginHandler(
    e: FormEvent,
    username: string,
    password: string
  ) {
    e.preventDefault();
    try {
      await axios.post(
        "/api/auth/login",
        {
          username: username,
          password: password,
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      router.push("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data.message);
        setIsError(true);
      }
    }
  }

  useEffect(() => {
    refreshToken();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <Mosaic color="#1242A2" size="large" />
        <p className="text-azure-700 font-bold text-2xl mt-4">Mohon tunggu</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-screen bg-white h-screen justify-center items-center">
        <div className="sm:w-1/2 md:w-2/5 lg:w-1/3 xl:w-1/4 w-11/12">
          <p className="text-center mb-6 text-3xl font-bold" data-aos="fade-up">
            <Link href="/">Sistem Pemilihan Laptop</Link>
          </p>
          <div className="flex flex-col border bg-white rounded-md mt-8 p-6">
            <div
              className={`px-4 py-4 border text-center border-red-200 bg-red-100 text-red-800 mb-6 ${
                isError ? "block" : "hidden"
              }`}>
              <p>{message}</p>
            </div>
            <form action="" className="w-full text-sm">
              <label htmlFor="username" className="font-bold">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <label htmlFor="password" className="font-bold">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                placeholder="Masukkan password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                className="bg-azure-700 text-white rounded-md py-2 mt-2 w-full active:scale-105 duration-150"
                onClick={e => loginHandler(e, username, password)}>
                Masuk
              </button>
            </form>
          </div>
          <div className="flex flex-col border bg-white rounded-md mt-8 p-4">
            <p className="text-sm text-center font-semibold">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="text-azure-800">
                Ayo Registrasi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
