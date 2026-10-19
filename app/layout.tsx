import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// Runs in <head> before paint, so no flash. localStorage.theme ('light' | 'dark', set in Profile) wins;
// unset follows the OS appearance, also when it changes while the page is open.
// A `dark` class (not just the media query) because thinking-orbs reads it.
const themeScript = `try{const m=matchMedia('(prefers-color-scheme: dark)'),s=()=>{const t=localStorage.theme;document.documentElement.classList.toggle('dark',t?t==='dark':m.matches)};s();m.addEventListener('change',s)}catch(e){}`;

export const metadata: Metadata = {
  title: { template: "%s · Wishy", default: "Wishy" },
  description: "Wishlists for birthdays, Christmas and everything in between",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning // themeScript adds `dark` before React hydrates
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
