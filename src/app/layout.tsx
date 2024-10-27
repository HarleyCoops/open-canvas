import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AdvisorX",
  description: "AdvisorX AI Assistant",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  await supabase.auth.getUser();

  const isAuthPage =
    children?.toString().includes("/auth/login") ||
    children?.toString().includes("/auth/signup");

  if (!session && !isAuthPage) {
    redirect("/auth/login");
  }

  if (session && isAuthPage) {
    redirect("/");
  }

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
