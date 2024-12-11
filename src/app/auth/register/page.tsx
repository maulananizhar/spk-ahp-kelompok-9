import { Metadata } from "next";
import Register from "@/app/auth/register/Register";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <>
      <div className="h-screen">
        <Register />
      </div>
    </>
  );
}
