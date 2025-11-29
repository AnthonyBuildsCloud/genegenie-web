"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type RsidEntry = {
  genotype: string;
  rawLine: string | null;
};

type ParsedDNA = {
  sampleLines: string[];
  totalCount: number;
  rsidMap: Record<string, RsidEntry>;
};

function parseDnaText(text: string): ParsedDNA {
  const lines = text.split(/\r?\n/);

  // Keep a small sample of the raw lines for flavor in the prompt
  const sampleLines: string[] = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    sampleLines.push(line);
    if (sampleLines.length >= 25) break;
  }

  // Find header line (Ancestry / 23andMe style)
  const headerIndex = lines.findIndex((l) =>
    l.toLowerCase().startsWith("rsid")
  );

  const rsidMap: Record<string, RsidEntry> = {};
  let totalCount = 0;

  if (headerIndex >= 0) {
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw) continue;
      if (raw.startsWith("#")) continue;

      const parts = raw.split(/\s+|\t/);
      if (parts.length < 4) continue;

      const rsid = parts[0];
      const genotype = parts[3] || parts[2] || "";

      if (!rsid || !genotype) continue;

      rsidMap[rsid] = {
        genotype,
        rawLine: raw,
      };
      totalCount++;
    }
  }

  if (totalCount === 0) {
    // Fallback: count non-comment lines
    totalCount = lines.filter(
      (l) => l.trim() && !l.startsWith("#")
    ).length;
  }

  return { sampleLines, totalCount, rsidMap };
}

export default function UploadPage() {
  const searchParams = useSearchParams();
  const pkg = (searchParams.get("pkg") || "tease").toLowerCase();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const [error, setError] = useState<string>("");

  const prettyPkgLabel =
    pkg === "ultimate"
      ? "Life Plan Ultimate"
      : pkg === "premium"
      ? "Biohacker Pack"
      : pkg === "core"
      ? "Wellness Core"
      : "DNA Tease";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setReport("");

    if (!file) {
      setError("Please choose a DNA file first.");
      return;
    }

    try {
      setIsLoading(true);

      const text = await file.text();
      const { sampleLines, totalCount, rsidMap } = parseDnaText(text);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pkg,
          sampleLines,
          totalCount,
          rsidMap,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ||
            `Server error (${res.status}). Please try again.`
        );
        return;
      }

      const data = await res.json();
      if (data?.report) {
        // IMPORTANT: no .slice(), no truncation here
        setReport(data.report as string);
      } else {
        setError("No report text was returned from the server.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err?.message || "Unexpected error while generating the report."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setReport("");
    setError("");
    setFileName(f ? f.name : "");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-[#050505] border border-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-semibold text-center mb-2">
          Upload your DNA file
        </h1>
        <p className="text-center text-sm text-gray-300 mb-6">
          Package:{" "}
          <span className="font-semibold">
            {prettyPkgLabel}
          </span>{" "}
          <span className="text-xs text-gray-400">
            ({pkg})
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose raw DNA file
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-black rounded-md cursor-pointer hover:bg-gray-200 text-sm font-medium">
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".txt,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-sm text-gray-300">
                {fileName || "No file chosen"}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported: raw DNA text files from Ancestry, 23andMe and
              similar services.
            </p>
          </div>

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full py-3 rounded-md text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Generating report..." : "Upload & Generate Report"}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-sm text-red-400 border border-red-500/50 rounded-md p-3 bg-red-500/5">
            {error}
          </div>
        )}

        {report && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">
              Your GeneGenie report
            </h2>
            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-4">
              {/* NO maxLength, NO slicing, full text */}
              <textarea
                readOnly
                value={report}
                className="w-full h-96 bg-transparent text-sm text-gray-100 resize-vertical whitespace-pre-wrap"
              />
              <p className="mt-2 text-[11px] text-gray-500">
                For entertainment and educational purposes only. Not
                medical advice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
