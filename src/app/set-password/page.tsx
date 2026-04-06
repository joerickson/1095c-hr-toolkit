import SetPasswordClient from "./SetPasswordClient";

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-navy-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-navy-700 font-bold text-xl">1095</span>
          </div>
          <h1 className="text-2xl font-bold text-white">1095-C HR Toolkit</h1>
          <p className="text-navy-200 mt-1">ACA Compliance</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Set your password
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Choose a password to complete your account setup.
          </p>

          <SetPasswordClient />
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          Tax Year {new Date().getFullYear()} · ACA 1095-C Compliance
        </p>
      </div>
    </div>
  );
}
