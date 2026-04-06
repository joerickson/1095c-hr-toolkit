'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveLanguagePreference(lang: 'en' | 'es') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ preferred_language: lang })
    .eq('id', user.id)
}
