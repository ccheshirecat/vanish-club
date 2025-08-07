import { Inter } from "next/font/google"
import type { Metadata, Viewport } from 'next'
import "./globals.css"
import { NotificationProvider } from "@/lib/notification-context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-gray-400 antialiased min-h-screen flex flex-col`}>
        <NotificationProvider>
          <AuthProvider>
            <Navigation />
            <main className="flex-grow">{children}</main>
            <footer className="border-t border-gray-900/50 py-6 text-center text-sm text-gray-500">
              <div className="container mx-auto px-4">© 2025 vanish.club. All rights reserved.</div>
            </footer>
            <Toaster />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
