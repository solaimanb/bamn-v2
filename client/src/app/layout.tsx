import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/providers'
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BAMN',
  description: 'Be A Mentor Now',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
