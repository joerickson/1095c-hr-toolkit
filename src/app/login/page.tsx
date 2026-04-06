"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("auth");
  const tn = useTranslations("navigation");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/checklist");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-navy-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-navy-700 font-bold text-xl">1095</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{tn("appName")}</h1>
          <p className="text-navy-200 mt-1">{tn("companyName")}</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("welcomeSubtitle")}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder={t("emailPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder={t("passwordPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm"
            >
              {loading ? t("signingIn") : t("signInButton")}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Contact your administrator if you need access.
          </p>
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          Tax Year {new Date().getFullYear()} · ACA 1095-C Compliance
        </p>
      </div>
    </div>
  );
}
