import { Providers } from "@/components/providers";
import "./globals.css"

export const metaDate = {
  title: {
    default: "Expense Manager",
    template: "%s | Expense Manager"
  },
  description: "A secure full-stack expense management application built with Next.js.",
  robots: {
    follow: false,
    index: false
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}