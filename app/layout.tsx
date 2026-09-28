import type { Metadata } from "next";
import { SITE_URL } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CalculatorHub",
  description: "Free financial calculators that work in any currency, anywhere.",
};

// Runs before first paint (a normal blocking <script>, not deferred) so a
// visitor who previously chose dark or light doesn't see a flash of the
// other theme while JS loads. Static, string-literal content — safe under
// React hydration since it never varies between server and client.
const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('theme-preference');if(p==='dark'||p==='light'){document.documentElement.setAttribute('data-theme',p);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
