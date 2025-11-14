"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clearLoggedIn, getStoredUser } from "../../lib/auth";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setName(stored.name ?? "");
      setEmail(stored.email ?? "");
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearLoggedIn();
    window.location.assign("/");
  }, []);

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Profile saved!");
  };

  const handleSavePreferences = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Preferences saved!");
  };

  return (
    <main className="bg-[#f6f0e6] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#26483f] shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-white">
          <Image
            src="https://cdn.prod.website-files.com/675c4350f0adea479ba8dab7/67608186495a13bdfd03f020_Logo.svg"
            alt="Valeria Logo"
            width={120}
            height={24}
            className="h-6 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/reports" className="header-nav-link transition hover:text-white/90">
              Reservation Report
            </Link>
            <span className="h-5 w-px bg-white/40" aria-hidden="true" />
            <button
              onClick={handleLogout}
              type="button"
              className="text-left transition hover:text-white/90"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gray-200 bg-white/95 p-8 shadow-xl ring-1 ring-black/5">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</p>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-lg font-semibold text-gray-900 focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-lg text-gray-900 focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Password</p>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 font-mono text-lg text-gray-900 focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
              />
              <p className="text-xs text-gray-400">Use at least 8 characters.</p>
            </div>

            <button className="inline-flex rounded-xl bg-[#2f7f5f] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#27654c]">
              Save profile
            </button>
          </form>

          <form onSubmit={handleSavePreferences} className="rounded-2xl bg-[#e8f5eb] p-6 text-sm text-[#26483f]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Communication</p>
            <h2 className="mt-1 text-xl font-semibold text-[#2f7f5f]">Preferences</h2>
            <p className="mt-2 text-gray-700">Choose how you stay informed about reservation activity.</p>

            <div className="mt-4 space-y-3 text-sm text-gray-800">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-[#316354]" />
                Email me a weekly summary
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#316354]" />
                Notify me when a CSV export finishes
              </label>
            </div>

            <button className="mt-6 inline-flex rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-[#2f7f5f] shadow hover:bg-white">
              Save preferences
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
