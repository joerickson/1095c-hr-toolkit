import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { IntlProvider } from "@/providers/IntlProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1095-C HR Toolkit — RBM Services Inc.",
  description: "ACA 1095-C compliance toolkit for HR teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <IntlProvider initialLanguage="en">
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
