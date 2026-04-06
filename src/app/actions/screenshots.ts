"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChecklistScreenshot } from "@/lib/types";

// Upload a screenshot file to Supabase Storage and record metadata
export async function uploadScreenshot(formData: FormData): Promise<{
  success: boolean;
  screenshot?: ChecklistScreenshot;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  const itemKey = formData.get("item_key") as string;
  const taxYear = parseInt(formData.get("tax_year") as string);
  const caption = formData.get("caption") as string | null;

  if (!file || !itemKey || !taxYear) {
    return { success: false, error: "Missing required fields" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Only JPEG, PNG, WebP, and GIF files are allowed",
    };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be under 5MB" };
  }

  // Generate storage path: {taxYear}/{itemKey}/{uuid}.{ext}
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${taxYear}/${itemKey}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("walkthrough-screenshots")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Get current max display_order for this item
  const { data: existing } = await supabase
    .from("checklist_screenshots")
    .select("display_order")
    .eq("item_key", itemKey)
    .eq("tax_year", taxYear)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  // Insert metadata record
  const { data: screenshot, error: dbError } = await supabase
    .from("checklist_screenshots")
    .insert({
      tax_year: taxYear,
      item_key: itemKey,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      caption: caption || null,
      uploaded_by: user.id,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up the uploaded file if DB insert fails
    await supabase.storage
      .from("walkthrough-screenshots")
      .remove([storagePath]);
    return { success: false, error: dbError.message };
  }

  // Return with camelCase shape matching ChecklistScreenshot
  const result: ChecklistScreenshot = {
    id: screenshot.id,
    taxYear: screenshot.tax_year,
    itemKey: screenshot.item_key,
    storagePath: screenshot.storage_path,
    fileName: screenshot.file_name,
    fileSize: screenshot.file_size,
    mimeType: screenshot.mime_type,
    caption: screenshot.caption,
    uploadedBy: screenshot.uploaded_by,
    uploadedAt: screenshot.uploaded_at,
    displayOrder: screenshot.display_order,
  };

  return { success: true, screenshot: result };
}

// Get all screenshots for a checklist item with signed URLs
export async function getScreenshots(
  itemKey: string,
  taxYear: number
): Promise<ChecklistScreenshot[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: screenshots } = await supabase
    .from("checklist_screenshots")
    .select("*")
    .eq("item_key", itemKey)
    .eq("tax_year", taxYear)
    .order("display_order", { ascending: true });

  if (!screenshots || screenshots.length === 0) return [];

  // Generate signed URLs for each screenshot (valid for 1 hour)
  const withUrls = await Promise.all(
    screenshots.map(async (s) => {
      const { data: urlData } = await supabase.storage
        .from("walkthrough-screenshots")
        .createSignedUrl(s.storage_path, 3600);
      const result: ChecklistScreenshot = {
        id: s.id,
        taxYear: s.tax_year,
        itemKey: s.item_key,
        storagePath: s.storage_path,
        fileName: s.file_name,
        fileSize: s.file_size,
        mimeType: s.mime_type,
        caption: s.caption,
        uploadedBy: s.uploaded_by,
        uploadedAt: s.uploaded_at,
        displayOrder: s.display_order,
        signedUrl: urlData?.signedUrl,
      };
      return result;
    })
  );

  return withUrls;
}

// Delete a screenshot (admin only — enforced at RLS level)
export async function deleteScreenshot(
  screenshotId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Fetch storage path before deleting metadata
  const { data: screenshot } = await supabase
    .from("checklist_screenshots")
    .select("storage_path")
    .eq("id", screenshotId)
    .single();

  if (!screenshot) return { success: false, error: "Screenshot not found" };

  // Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from("walkthrough-screenshots")
    .remove([screenshot.storage_path]);

  if (storageError) return { success: false, error: storageError.message };

  // Delete metadata record
  const { error: dbError } = await supabase
    .from("checklist_screenshots")
    .delete()
    .eq("id", screenshotId);

  if (dbError) return { success: false, error: dbError.message };

  return { success: true };
}
