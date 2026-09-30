import localFont from "next/font/local";

export const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-Variable.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/Fraunces-VariableItalic.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-Variable.woff2", weight: "200 700", style: "normal" },
    { path: "./fonts/GeneralSans-VariableItalic.woff2", weight: "200 700", style: "italic" },
  ],
  variable: "--font-general",
  display: "swap",
});
