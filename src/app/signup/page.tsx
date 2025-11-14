"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { markLoggedIn, resolveUserFromPayload } from "../../lib/auth";

const LOGIN_URL = "https://xdti-9vsw-swso.e2.xano.io/api:ejSfrA89:v3.2/auth/login";
const SIGNUP_URL = "https://xdti-9vsw-swso.e2.xano.io/api:ejSfrA89:v3.2/auth/signup";

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const passwordsMismatch = mode === "signup" && confirmPassword && password && confirmPassword !== password;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === "login") {
      if (!email || !password) {
        setError("Please provide both email and password.");
        return;
      }
    } else {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("Please complete every field to create your account.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(mode === "login" ? LOGIN_URL : SIGNUP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:
          mode === "login"
            ? JSON.stringify({ email, password })
            : JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email,
                password
              })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? (mode === "login" ? "Unable to log in. Please try again." : "Unable to create your account."));
      }

      if (mode === "login") {
        const user = resolveUserFromPayload(payload, email);
        markLoggedIn(user);
        setSuccessMessage("Login successful! Redirecting to your dashboard…");
        window.setTimeout(() => router.push("/reports"), 1500);
      } else {
        setSuccessMessage("Account created! You can now log in.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[900px] bg-[#f6f0e6] px-4 py-12 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-emerald-900/20 pb-6">
        <Link href="/" className="flex items-center gap-3 text-[#26483f]">
          <Image
            src="https://cdn.prod.website-files.com/675c4350f0adea479ba8dab7/67608186495a13bdfd03f020_Logo.svg"
            alt="Valeria Logo"
            width={140}
            height={32}
            className="h-8 w-auto"
            style={{ filter: "brightness(0) saturate(100%)" }}
            priority
          />
        </Link>
      </header>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#2f7f5f]/20 bg-[#2f7f5f] p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Welcome</p>
          <h1 className="mt-3 text-3xl font-semibold">The Valeria Report Portal</h1>
          <p className="mt-4 text-sm text-white/80">Build a Reservation Report for check-ins and check-outs.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl ring-1 ring-black/5">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">{mode === "login" ? "Log in to your account" : "Create Your Account"}</h2>
          <p className="mb-6 text-sm text-gray-500">
            {mode === "login"
              ? "Access reservation reports, export CSVs, and stay aligned with your portfolio."
              : "Fill out the details below to create your Valeria Reports account."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="inline-first-name" className="mb-1 block text-sm font-semibold text-gray-700">
                    First name
                  </label>
                  <input
                    id="inline-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
                    placeholder="Alex"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label htmlFor="inline-last-name" className="mb-1 block text-sm font-semibold text-gray-700">
                    Last name
                  </label>
                  <input
                    id="inline-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
                    placeholder="Morgan"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="inline-email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="inline-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="inline-password" className="mb-1 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="inline-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#316354] focus:outline-none focus:ring-1 focus:ring-[#316354]"
                placeholder={mode === "login" ? "••••••••" : "At least 8 characters"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label htmlFor="inline-confirm-password" className="mb-1 block text-sm font-semibold text-gray-700">
                  Confirm password
                </label>
                <input
                  id="inline-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    passwordsMismatch ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#316354] focus:ring-[#316354]"
                  }`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                {passwordsMismatch && <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>}
              </div>
            )}

            {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {successMessage && (
              <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2f7f5f] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#27654c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Log In" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#2f7f5f] transition hover:text-[#27654c]"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  Create your account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#2f7f5f] transition hover:text-[#27654c]"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
