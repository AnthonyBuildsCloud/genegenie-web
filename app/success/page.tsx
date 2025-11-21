"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_PACKAGES = [
  "tease",
  "wellness-core",
  "biohacker-pack",
  "life-plan",
  "personality-pack",
  "parent-decoder",
] as const;

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const pkg = params.get("pkg");

    if (!pkg || !ALLOWED_PACKAGES.includes(pkg as any)) {
      router.replace("/");
      return;
    }

    const entitlement = { isPaid: true, pkg };

    window.localStorage.setItem("entitlement", JSON.stringify(entitlement));
    router.replace(`/upload?pkg=${pkg}`);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Finalizing your order… redirecting to upload.</p>
    </main>
  );
}
