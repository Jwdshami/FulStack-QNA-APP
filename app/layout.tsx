import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "./components/Header";
import getOrCreateDB from "@/src/models/server/dbsetup";
import getOrCreateStorage from "@/src/models/server/storage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RiverFlow",
  description: "Ask questions, share knowledge, and collaborate with developers worldwide.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getOrCreateDB();
  await getOrCreateStorage();

  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "dark:bg-black dark:text-white")}>
        <Header />
        {children}
      </body>
    </html>
  );
}