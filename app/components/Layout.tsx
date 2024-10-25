import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <h1 className="text-2xl font-bold">RoadTripAI</h1>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
    </div>
  )
}