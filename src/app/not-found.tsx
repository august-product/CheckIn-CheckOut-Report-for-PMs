"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isLoggedIn } from "../lib/auth";

export default function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    const destination = isLoggedIn() ? "/reports" : "/";
    const timeout = window.setTimeout(() => router.replace(destination), 50);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f0e6] px-4 text-slate-900">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#316354]">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold">Redirecting you to safety…</h1>
        <p className="mt-4 text-sm text-gray-600">We couldn&apos;t find that page. Hang tight while we send you to the right place.</p>
      </div>
    </main>
  );
}
