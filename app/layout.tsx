import type { Metadata } from 'next'
import { M_PLUS_Rounded_1c, Quicksand } from 'next/font/google'
import { PetProvider } from '@/lib/context/PetContext'
import './globals.css'

const mplus = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bakitty - Семейный трекер питомцев',
  description: 'Заботьтесь о питомцах вместе с семьёй',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${mplus.className} ${quicksand.className}`}>
        <PetProvider>
          {children}
        </PetProvider>
      </body>
    </html>
  )
}