import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext';
import { GlobalLicenseProvider } from '../contexts/GlobalLicenseContext';
import ClientLayoutShell from './ClientLayoutShell';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ЕУК Платформа',
  description: 'ЕУК Платформа за управљање социјалном заштитом',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <AuthProvider>
          <GlobalLicenseProvider>
            <ClientLayoutShell>
              {children}
            </ClientLayoutShell>
          </GlobalLicenseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
