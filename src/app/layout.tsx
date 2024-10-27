import "./globals.css";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { createClient } from "../lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AdvisorX",
  description: "AdvisorX AI Assistant",
  icons: {
    icon: "/lc_logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

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
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
