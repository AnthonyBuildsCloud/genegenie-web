"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Entitlement = { isPaid: boolean; pkg: string };

export default function UploadPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [pkgParam, setPkgParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read ?pkg=... from the URL
    const params = new URLSearchParams(window.location.search);
    setPkgParam(params.get("pkg"));

    // Check entitlement in localStorage
    const raw = window.localStorage.getItem("entitlement");
    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      const parsed: Entitlement = JSON.parse(raw);
      if (!parsed.isPaid) {
        router.replace("/");
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput =
      form.querySelector<HTMLInputElement>('input[type="file"]');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please choose a DNA file first.");
      return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);
    if (pkgParam) formData.append("pkg", pkgParam);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload failed:", res.status, text);
        alert("Something went wrong processing your DNA. Try again.");
        return;
      }

      const data = await res.json();
      console.log("Report data:", data);

      if (data.report) {
        alert(
          "Here is a preview of your GeneGenie report:\n\n" +
            String(data.report).slice(0, 400) +
            "\n\n(Next step: show this on a dedicated report page.)"
        );
      } else {
        alert("Upload succeeded, but no report text was returned.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error talking to the server.");
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Checking your access…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-lg w-full p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Upload your DNA file</h1>
        <p className="text-sm text-gray-300">
          Package: <strong>{pkgParam ?? "unknown"}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".txt,.csv,.zip"
            className="block w-full text-sm text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-md border border-gray-500 font-medium"
          >
            Upload &amp; Generate Report
          </button>
        </form>
      </div>
    </main>
  );
}
