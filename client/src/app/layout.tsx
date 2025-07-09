import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BAMN - Be A Mentor Now',
  description: 'Connect with mentors around the globe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Initialize Cesium configuration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.CESIUM_BASE_URL = '/cesium';
              window.CESIUM_ION_TOKEN = '${process.env.NEXT_PUBLIC_CESIUM_TOKEN}';
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
