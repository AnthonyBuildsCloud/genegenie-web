"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function UploadPage() {
  const searchParams = useSearchParams();
  const pkg = searchParams.get("pkg") || "tease";

  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);

    if (!file) {
      setError("Please choose a DNA file before uploading.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pkg", pkg);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error || "Something went wrong while generating your report."
        );
        return;
      }

      if (!data.report) {
        setError(
          "We generated a response but couldn’t extract the text properly. Check the server logs."
        );
        console.warn("Raw model output:", data.raw);
        return;
      }

      setReport(data.report as string);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-xl w-full border border-neutral-800 rounded-2xl p-8 shadow-lg bg-neutral-950/80">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Upload your DNA file
        </h1>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          Package: <span className="font-medium text-neutral-100">{pkg}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose file
            </label>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setReport(null);
                setError(null);
              }}
              className="block w-full text-sm text-neutral-200
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-neutral-800 file:text-neutral-100
                         hover:file:bg-neutral-700"
            />
            {file && (
              <p className="mt-1 text-xs text-neutral-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5
                       rounded-md text-sm font-medium
                       bg-emerald-500 hover:bg-emerald-400
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? "Generating GeneGenie report..." : "Upload & Generate Report"}
          </button>
        </form>

        {report && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              Your GeneGenie teaser report
            </h2>
            <div className="text-sm text-neutral-100 bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 max-h-80 overflow-y-auto whitespace-pre-line">
              {report}
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">
              For entertainment and educational purposes only. Not medical
              advice.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
