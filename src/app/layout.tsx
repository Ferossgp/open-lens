import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Open Lens - the best people a search away',
  description: 'Find degens, engineers, and artists that match your interest the most!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col min-h-screen pt-24 px-4">
          <header className="flex flex-row justify-center items-center h-24 w-full">
            <a href='/'>
              <h1 className="text-3xl font-bold">🤲 🌿</h1>
            </a>
          </header>
          {children}
          <footer className="flex flex-row justify-center items-center h-24 w-full">
            <a href="https://twitter.com/3loop_io" target="_blank" className="text-sm">Made with ❤️ by 3loop Team</a>
          </footer>
        </main >
      </body>
    </html>
  )
}
