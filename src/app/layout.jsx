import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

// Brand fonts. Swapping the brand = edit these two imports + the tokens in globals.css.
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const body = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Third Place CLT",
    template: "%s · Third Place CLT",
  },
  description: site.description,
};

export const viewport = {
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh font-body">{children}</body>
    </html>
  );
}
