"use client";

import { FormEvent, useEffect, useState } from "react";

type RsidEntry = {
  genotype: string;
  rawLine: string | null;
};

// Union of all rsIDs used in panels on the server
const PANEL_RSIDS = [
  // Methylation / detox
  "rs1801133", // MTHFR C677T
  "rs1801131", // MTHFR A1298C
  "rs4680",    // COMT Val158Met
  "rs234706",  // MTRR
  "rs1805087", // MTR

  // Nutrition / weight
  "rs9939609", // FTO
  "rs1558902", // FTO appetite
  "rs7903146", // TCF7L2
  "rs17782313", // MC4R
  "rs662799", // APOA5

  // Fitness / performance
  "rs1815739", // ACTN3
  "rs1042713", // ADRB2
  "rs1042714", // ADRB2
  "rs4253778", // PPARGC1A

  // Sleep / circadian
  "rs1801260", // CLOCK
  "rs5751876", // ADORA2A

  // Dopamine / mood
  "rs4685",   // COMT
  "rs6269",   // COMT
  "rs6323",   // MAOA

  // Caffeine / stimulant
  "rs762551", // CYP1A2

  // Recovery / inflammation
  "rs1800795", // IL6
  "rs1143627", // IL1B
  "rs2243250", // IL4
];

const RSID_SET = new Set(PANEL_RSIDS);

function getDataLines(fullText: string): string[] {
  const allLines = fullText.split(/\r?\n/);
  return allLines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("#")) return false;
    if (!trimmed.includes("\t") && !trimmed.includes(",")) return false;
    return true;
  });
}

function buildClientRsidMap(dataLines: string[]): Record<string, RsidEntry> {
  const map: Record<string, RsidEntry> = {};

  for (const line of dataLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/[\t,]/);
    if (parts.length < 2) continue;

    const rsid = parts[0].trim();
    if (!RSID_SET.has(rsid)) continue;

    let genotype = "";
    if (parts.length >= 5) {
      const a1 = parts[3]?.trim() ?? "";
      const a2 = parts[4]?.trim() ?? "";
      genotype = (a1 + a2).toUpperCase();
    } else if (parts.length >= 4) {
      genotype = (parts[3]?.trim() ?? "").toUpperCase();
    } else {
      genotype = parts[parts.length - 1]?.trim().toUpperCase();
    }
    if (!genotype) genotype = "UNKNOWN";

    if (!map[rsid]) {
      map[rsid] = { genotype, rawLine: trimmed };
    }
  }

  return map;
}

export default function UploadPage() {
  const [pkg, setPkg] = useState("tease");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("pkg");
      if (value) setPkg(value.toLowerCase());
    }
  }, []);

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

      // 1️⃣ Read the full DNA file in the browser
      const fullText = await file.text();
      const dataLines = getDataLines(fullText);
      const totalCount = dataLines.length;

      if (totalCount === 0) {
        setError(
          "We couldn't find any recognizable DNA lines in this file. Make sure it's the raw data export (e.g., AncestryDNA.txt)."
        );
        return;
      }

      // 2️⃣ Build a small rsid → genotype map for the SNPs we care about
      const rsidMap = buildClientRsidMap(dataLines);

      // 3️⃣ Take a small sample of lines for flavor / teaser text
      const sampleLines = dataLines.slice(0, 80);

      // 4️⃣ Send a small JSON payload instead of the whole file
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pkg,
          sampleLines,
          totalCount,
          rsidMap,
        }),
      });

      let rawText: string | null = null;
      let data: any = null;

      try {
        rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        // Server returned non-JSON (e.g. HTML error)
        setError(
          rawText?.slice(0, 200) ||
            "Server returned a non-JSON response. Please try again."
        );
        return;
      }

      if (!res.ok) {
        setError(
          data?.error ||
            "Something went wrong while generating your GeneGenie report."
        );
        return;
      }

      if (!data.report) {
        setError("Model did not return any text. Please try again.");
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
          Package:{" "}
          <span className="font-medium text-neutral-100">
            {pkg === "tease"
              ? "DNA Tease (teaser)"
              : pkg === "core"
              ? "Wellness Core"
              : pkg === "premium"
              ? "Biohacker Pack"
              : pkg === "ultimate"
              ? "Life Plan Ultimate"
              : pkg}
          </span>{" "}
          <span className="text-xs text-neutral-500">
            ({pkg})
          </span>
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
            {loading
              ? "Generating GeneGenie report..."
              : "Upload & Generate Report"}
          </button>
        </form>

        {report && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              {pkg === "tease"
                ? "Your GeneGenie teaser report"
                : "Your GeneGenie report"}
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
