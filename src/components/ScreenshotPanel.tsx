"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  uploadScreenshot,
  getScreenshots,
  deleteScreenshot,
} from "@/app/actions/screenshots";
import type { ChecklistScreenshot } from "@/lib/types";

interface Props {
  itemKey: string;
  taxYear: number;
  isAdmin: boolean;
}

export default function ScreenshotPanel({ itemKey, taxYear, isAdmin }: Props) {
  const t = useTranslations("screenshots");
  const tCommon = useTranslations("common");
  const [screenshots, setScreenshots] = useState<ChecklistScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [lightbox, setLightbox] = useState<ChecklistScreenshot | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getScreenshots(itemKey, taxYear).then((data) => {
      setScreenshots(data);
      setLoading(false);
    });
  }, [itemKey, taxYear]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("item_key", itemKey);
    formData.append("tax_year", String(taxYear));
    if (caption.trim()) formData.append("caption", caption.trim());

    const result = await uploadScreenshot(formData);

    if (result.success && result.screenshot) {
      setScreenshots((prev) => [...prev, result.screenshot!]);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setUploadError(result.error ?? "Upload failed");
    }

    setUploading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteScreenshot(id);
    if (result.success) {
      setScreenshots((prev) => prev.filter((s) => s.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    }
  }

  return (
    <div className="mt-3 border border-dashed border-blue-200 rounded-lg p-3 bg-blue-50/30">
      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
        <svg
          className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {t("title")}
      </p>

      {loading ? (
        <p className="text-xs text-gray-400">{tCommon("loading")}</p>
      ) : (
        <>
          {screenshots.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {screenshots.map((s) => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => setLightbox(s)}
                    className="block w-20 h-20 rounded border border-gray-200 overflow-hidden bg-white hover:border-navy-400 transition-colors"
                    title={s.caption ?? s.fileName}
                  >
                    {s.signedUrl ? (
                      <img
                        src={s.signedUrl}
                        alt={s.caption ?? s.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none"
                      title={t("deleteConfirm")}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3">
              {t("noScreenshots")}
            </p>
          )}

          {/* Upload controls */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t("captionLabel")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
            />
            <label
              className={`text-xs btn-secondary py-1.5 px-2 cursor-pointer whitespace-nowrap ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {uploading ? t("uploading") : t("addScreenshot")}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 mt-1.5">{uploadError}</p>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label={tCommon("close")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {lightbox.signedUrl && (
              <img
                src={lightbox.signedUrl}
                alt={lightbox.caption ?? lightbox.fileName}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
            {lightbox.caption && (
              <p className="px-4 py-2 text-sm text-gray-600 border-t border-gray-100">
                {lightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
