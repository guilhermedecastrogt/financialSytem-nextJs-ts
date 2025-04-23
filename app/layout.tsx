import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { DataProvider } from "@/lib/data-context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import SessionProviderWrapper from "./providers/SessionProviderWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema Financeiro",
  description: "Sistema de gerenciamento financeiro para receitas e despesas",
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
        <AuthProvider>
          <DataProvider>
              <SessionProviderWrapper>
                  <div className="flex min-h-screen">
                      <Sidebar />
                      <div className="flex-1 lg:ml-64 transition-all duration-300">
                          <main className="h-screen overflow-y-auto p-6 md:p-8">{children}</main>
                      </div>
                  </div>
                  <Toaster />
              </SessionProviderWrapper>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
      </body>
      </html>
  )
}
