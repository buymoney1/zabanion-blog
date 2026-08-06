import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}