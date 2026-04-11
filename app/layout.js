import { Instrument_Serif, Syne, DM_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const syne = Syne({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Lernhub — Happy Learning",
  description: "Interaktive Lernseiten für Schule und Neugier",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${instrumentSerif.variable} ${syne.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
