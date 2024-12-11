import { Metadata } from "next";
import Login from "@/app/auth/login/Login";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <>
      <div className="h-screen">
        <Login />
      </div>
    </>
  );
}
