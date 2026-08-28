import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { dirOf } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { LocaleProvider } from "@/lib/locale-client";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: {
    default: "Clinica · Clinic Suite",
    template: "%s · Clinica",
  },
  description:
    "Clinica is the operating system for aesthetics clinics in Egypt — scheduling, client records, packages and payments in one place.",
  applicationName: "Clinica",
};

export const viewport: Viewport = {
  themeColor: "#7A2F5F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${sans.variable} ${display.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
