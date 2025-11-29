"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type RsidEntry = {
  genotype: string;
  rawLine: string | null;
};

const TARGET_RSIDS = [
  // Methylation / detox
  "rs1801133", // MTHFR C677T
  "rs1801131", // MTHFR A1298C
  "rs4680",    // COMT Val158Met
  "rs234706",  // MTRR
  "rs1805087", // MTR

  // Nutrition / weight
  "rs9939609", // FTO
  "rs1558902",
  "rs7903146", // TCF7L2
  "rs17782313",// MC4R
  "rs662799",  // APOA5

  // Fitness / performance
  "rs1815739", // ACTN3
  "rs1042713", // ADRB2
  "rs1042714", // ADRB2
  "rs4253778", // PPARGC1A

  // Sleep / circadian / caffeine
  "rs1801260", // CLOCK
  "rs5751876", // ADORA2A
  "rs762551",  // CYP1A2

  // Dopamine / mood
  "rs6269",    // COMT
  "rs6323",    // MAOA

  // Recovery / inflammation
  "rs1800795", // IL6
  "rs1143627", // IL1B
  "rs2243250", // IL4
];

function parseDnaText(fileText: string) {
  const lines = fileText.split(/\r?\n/);
  const sampleLines: string[] = [];
  const rsidMap: Record<string, RsidEntry> = {};

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;

    if (sampleLines.length < 40) {
      sampleLines.push(line);
    }

    const parts = line.split(/\s+|\t/);
    const rsid = parts[0];
    const genotype = parts[3] || "";

    if (TARGET_RSIDS.includes(rsid)) {
      rsidMap[rsid] = {
        genotype: genotype || "missing",
        rawLine: line,
      };
    }
  }

  return {
    sampleLines,
    totalCount: lines.filter((l) => l && !l.startsWith("#")).length,
    rsidMap,
  };
}

const PACKAGE_LABELS: Record<string, string> = {
  tease: "DNA Tease",
  core: "Wellness Core",
  premium: "Biohacker Pack",
  ultimate: "Ultimate Life Plan",
};

export default function UploadPage() {
  const searchParams = useSearchParams();
  const pkg = (searchParams.get("pkg") || "tease").toLowerCase();

  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setReport("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReport("");

    if (!file) {
      setError("Please choose a DNA file first.");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT: we only send a tiny summary, not the raw file.
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
        setError(`Server error (${res.status}). Please try again.`);
        return;
      }

      const data = await res.json();
      setReport(data.report || "");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Unexpected error while uploading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pkgLabel = PACKAGE_LABELS[pkg] || "DNA Tease";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl border border-neutral-800 rounded-2xl bg-neutral-950/80 p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-2">
          Upload your DNA file
        </h1>
        <p className="text-center text-neutral-400 mb-6">
          Package: <span className="font-semibold text-white">{pkgLabel}</span>{" "}
          <span className="text-sm text-neutral-500">({pkg})</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose raw DNA file
            </label>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-200
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-emerald-600 file:text-white
                         hover:file:bg-emerald-500"
            />
            <p className="mt-2 text-xs text-neutral-500">
              Supported: raw DNA text files from Ancestry, 23andMe and similar
              services.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full rounded-md bg-emerald-600 py-3 text-center font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-500 transition"
          >
            {loading ? "Generating report..." : "Upload & Generate Report"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Your GeneGenie report</h2>
          <textarea
            readOnly
            value={report}
            className="w-full h-80 bg-black border border-neutral-800 rounded-lg p-4 text-sm font-mono text-neutral-100 resize-vertical"
          />
          <p className="mt-2 text-xs text-neutral-500">
            For entertainment and educational purposes only. Not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
