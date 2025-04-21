import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Nikel Change Ofis - Telegram Kripto Bot",
  description: "Kripto para dönüşümleri ve fiyat takibi için Telegram botu",
  generator: "oioioi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
