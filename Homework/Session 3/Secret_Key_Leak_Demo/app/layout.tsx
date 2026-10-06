import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "What happens when a secret key leaks? (educational demo)",
  description: "Local demo with fake credentials and a mock API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
