import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

const features = [
  {
    href: "/audit-checklist",
    title: "Audit Checklist",
    description:
      "Step through the complete ACA 1095-C compliance checklist. Your progress is saved automatically per user.",
    icon: "✅",
    color: "from-green-500 to-emerald-600",
    badge: "Persistent state",
  },
  {
    href: "/code-lookup",
    title: "Code Lookup Wizard",
    description:
      "Interactive wizard to identify the correct codes for Lines 14, 15, and 16 of Form 1095-C with plain-English explanations.",
    icon: "🔍",
    color: "from-blue-500 to-indigo-600",
    badge: "Lines 14 / 15 / 16",
  },
  {
    href: "/employee-tracker",
    title: "Employee Tracker",
    description:
      "Track employee ACA eligibility, offer codes, and coverage status. Records sync to Supabase in real time.",
    icon: "👥",
    color: "from-purple-500 to-violet-600",
    badge: "Supabase synced",
  },
  {
    href: "/winteam-guide",
    title: "WinTeam Setup Guide",
    description:
      "Step-by-step reference for configuring WinTeam to generate accurate 1095-C data for ABC Janitorial Services.",
    icon: "📖",
    color: "from-orange-500 to-amber-600",
    badge: "Reference",
  },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userEmail={user.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            1095-C HR Toolkit
          </h1>
          <p className="text-gray-500 mt-1">
            ABC Janitorial Services — ACA Compliance Tools
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{feature.icon}</span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {feature.badge}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mt-4 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Open →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>Note:</strong> This toolkit is intended for internal HR use by
          ABC Janitorial Services. All employee data is stored securely in
          Supabase and is accessible only to authenticated users.
        </div>
      </main>
    </div>
  );
}
