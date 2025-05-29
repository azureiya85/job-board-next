import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Vault - Your Next Career Awaits",
  description: "Discover diverse job opportunities and connect with top employers. Work Vault helps you find your dream job or the perfect candidate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body className="antialiased"> 
        <main>{children}</main>
      </body>
    </html>
  );
}