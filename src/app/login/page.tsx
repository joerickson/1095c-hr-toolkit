"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const tn = useTranslations("navigation");

  const callbackError = searchParams.get("error");

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

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: "https://rbmhr.com/auth/callback",
    });

    // Always show success — do not reveal whether email exists
    setForgotSent(true);
    setForgotLoading(false);
  }

  function switchToForgot() {
    setView("forgot");
    setForgotEmail("");
    setForgotSent(false);
    setError(null);
  }

  function switchToLogin() {
    setView("login");
    setForgotSent(false);
    setError(null);
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

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {view === "login" ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("welcomeSubtitle")}</h2>

              {callbackError === "auth_callback_failed" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  Your sign-in link has expired. Please try again.
                </div>
              )}

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

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-sm text-navy-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Contact your administrator if you need access.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={switchToLogin}
                className="text-sm text-navy-600 hover:underline mb-6 flex items-center gap-1"
              >
                ← Back to sign in
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Forgot your password?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email address and we will send you a link to reset
                your password.
              </p>

              {forgotSent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                    Check your email. If an account exists for {forgotEmail},
                    you will receive a password reset link shortly.
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-sm text-navy-600 hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full btn-primary py-2.5 text-sm"
                  >
                    {forgotLoading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          Tax Year {new Date().getFullYear()} · ACA 1095-C Compliance
        </p>
      </div>
    </div>
  );
}
