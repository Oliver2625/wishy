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
// A `dark` class (not just the media query) because thinking-orbs and Tailwind's dark: variant read it;
// data-theme picks the colour tokens in globals.css. Keep in step with AppearancePicker.
const themeScript = `try{const m=matchMedia('(prefers-color-scheme: dark)'),e=document.documentElement,s=()=>{const t=localStorage.theme,d=t?t==='dark':m.matches;e.classList.toggle('dark',d);e.dataset.theme=d?'dark':'light'};s();m.addEventListener('change',s)}catch(e){}`;

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
