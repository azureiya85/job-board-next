'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "../components/molecules/navbar/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <html lang="id" suppressHydrationWarning> 
      <body className="antialiased"> 
        {!isDashboard && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  );
}