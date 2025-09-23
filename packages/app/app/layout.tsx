import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharesnap",
  description: "Quickly share pictures from phone to desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
