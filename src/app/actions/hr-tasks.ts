'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHrTaskProgress(taskKey: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('hr_task_progress')
      .select('value')
      .eq('task_key', taskKey)
      .single()
    return data?.value ?? 0
  } catch {
    return 0
  }
}

export async function updateHrTaskProgress(taskKey: string, value: number): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('hr_task_progress')
      .upsert({ task_key: taskKey, value, updated_at: new Date().toISOString(), updated_by: user.id })
  } catch {
    // Table may not exist yet — fail silently
  }
}
