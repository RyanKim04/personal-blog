import type { Metadata } from "next";
import { site } from "@/content/site";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./prose.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.profile.bio,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
