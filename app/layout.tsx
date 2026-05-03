import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { FilterProvider }  from "@/providers/FilterContext";
import { SoundProvider  }  from "@/providers/SoundContext";
import { ThemeProvider  }  from "@/providers/ThemeContext";
import ClickSparkWrapper    from "@/components/ui/ClickSparkWrapper";

export const metadata: Metadata = {
  title: "Strokiy",
  description: "Geometric SVG illustrations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Read persisted theme on the server so the initial render is already
     correct — no React state flash, no hydration mismatch. */
  const cookieStore = await cookies();
  const raw = cookieStore.get('strokiy-theme')?.value;
  const initialTheme: 'light' | 'dark' = raw === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        {/* Blocking script: aplica data-theme antes de qualquer paint para evitar FOUC */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=document.cookie.match(/strokiy-theme=(dark|light)/);if(!t){try{t=[,localStorage.getItem('strokiy-theme')]}catch{}}if(t&&t[1]==='dark')document.documentElement.setAttribute('data-theme','dark');}catch{}})();` }} />
        <SoundProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <ClickSparkWrapper>
              <FilterProvider>{children}</FilterProvider>
            </ClickSparkWrapper>
          </ThemeProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
