import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SentryProvider } from '@/components/providers/SentryProvider';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MECA Admin Dashboard",
  description: "Painel Administrativo MECA - Gestão de Oficinas e Serviços",
  icons: {
    icon: '/assets/icone_verde.png',
    apple: '/assets/icone_verde.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SentryProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  padding: '16px',
                  fontSize: '14px',
                },
              }}
            />
            {children}
          </SentryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
