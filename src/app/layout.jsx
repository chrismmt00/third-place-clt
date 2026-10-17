import { Bagel_Fat_One, Bricolage_Grotesque, Courier_Prime, Figtree, Hanken_Grotesk } from "next/font/google";
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

// Public-site direction (see .theme-zine in globals.css). Admin keeps the fonts above.
const zineDisplay = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: "400",
});

const zineBody = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const zineMono = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en" className={`${display.variable} ${body.variable} ${zineDisplay.variable} ${zineBody.variable} ${zineMono.variable}`}>
      <body className="min-h-dvh font-body">{children}</body>
    </html>
  );
}
