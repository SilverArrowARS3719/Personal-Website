import { Geist, Geist_Mono, Archivo } from "next/font/google";
import { profile } from "@/lib/content";
import Backdrop from "@/components/Backdrop";
import Cursor from "@/components/Cursor";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-body" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-code" });
const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-grotesk",
});

export const metadata = {
  title: `${profile.name}, building things in Singapore`,
  description:
    "14-year-old builder from the School of Science and Technology, Singapore. Robotics, design engineering and sustainability projects, with national awards in engineering and design.",
  openGraph: {
    title: `${profile.name}`,
    description: profile.headline,
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        {/*
          Runs before first paint so a reader who chose paper mode never sees a
          navy flash. Deliberately tiny and synchronous; anything async here
          would defeat the point.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="paper"){document.documentElement.setAttribute("data-theme","paper")}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Motion>
          <Backdrop />
          <Cursor />
          <Nav />
          <CommandPalette />
          <main>{children}</main>
          <Footer />
        </Motion>
      </body>
    </html>
  );
}
