"use server";

import { createClient } from "@/lib/supabase/server";

export async function getHrTaskProgress(taskKey: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("hr_task_progress")
      .select("count")
      .eq("task_key", taskKey)
      .single();
    return data?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function updateHrTaskProgress(
  taskKey: string,
  count: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("hr_task_progress")
      .upsert({ task_key: taskKey, count }, { onConflict: "task_key" });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
