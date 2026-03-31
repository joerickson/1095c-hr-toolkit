import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: '1095-C HR Toolkit | ABC Janitorial Services',
  description: 'ACA compliance toolkit for managing 1095-C forms and employee health coverage data.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Auth pages get a minimal layout
  const isAuthRoute = false // middleware handles redirect; layout just checks user

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {user ? (
          <div className="flex min-h-screen">
            <Navigation userEmail={user.email} />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        ) : (
          <main className="min-h-screen">
            {children}
          </main>
        )}
      </body>
    </html>
  )
}
