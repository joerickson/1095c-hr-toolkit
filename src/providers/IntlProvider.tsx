'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'

export type Language = 'en' | 'es'

interface IntlProviderProps {
  children: React.ReactNode
  initialLanguage: Language
}

export function IntlProvider({ children, initialLanguage }: IntlProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  // Listen for language change events from the nav toggle
  useEffect(() => {
    const handler = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }
    window.addEventListener('languageChange', handler as EventListener)
    return () => window.removeEventListener('languageChange', handler as EventListener)
  }, [])

  const messages = language === 'es' ? esMessages : enMessages

  return (
    <NextIntlClientProvider locale={language} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

// Global helper to trigger language change from anywhere
export function changeLanguage(lang: Language) {
  window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
}
