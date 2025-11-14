"use client";

import Link from "next/link";

export default function AuthIndexPage() {
  return (
    <main className="flex min-h-screen bg-[#f6f0e6] px-4 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-8 py-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#316354]">Existing members</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Sign in to explore your portfolio</h1>
            <p className="mt-2 text-sm text-gray-500">
              Access reservation reports, export CSVs, and stay aligned with your team.
            </p>
          </div>
          <div className="px-8 py-10">
            <div className="rounded-2xl bg-[#e8f5eb] p-6">
              <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
              <p className="mt-2 text-sm text-gray-600">
                Use the email and password provided by your administrator to log into the dashboard.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2f7f5f] px-5 py-2 font-semibold text-white shadow-lg transition hover:bg-[#27654c]"
              >
                Go to Sign In
              </Link>
              <div className="mt-6 flex items-center text-xs uppercase tracking-wide text-gray-500">
                <span className="h-px flex-1 bg-gray-300" />
                <span className="px-3">Need help?</span>
                <span className="h-px flex-1 bg-gray-300" />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Contact{" "}
                <a href="mailto:support@example.com" className="font-semibold text-[#2f7f5f]">
                  support@example.com
                </a>{" "}
                if you need assistance with your credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
          <div className="border-b border-gray-100 px-8 py-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">New members</p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Set up a new profile to begin creating and sharing reservation reports.
            </p>
          </div>
          <div className="px-8 py-10">
            <div className="rounded-2xl bg-[#fff4e4] p-6">
              <h3 className="text-xl font-semibold text-gray-900">Create an account</h3>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll guide you through a few quick steps to get started, then point you back to the dashboard.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ffda9d] text-xs font-semibold text-[#8f640e]">
                    1
                  </span>
                  Provide your contact details
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ffda9d] text-xs font-semibold text-[#8f640e]">
                    2
                  </span>
                  Pick a secure password
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ffda9d] text-xs font-semibold text-[#8f640e]">
                    3
                  </span>
                  Start generating reports
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#d1810d] px-5 py-2 font-semibold text-white shadow-lg transition hover:bg-[#b46804]"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
