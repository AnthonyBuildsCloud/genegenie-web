import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

type PanelId =
  | "methylation"
  | "nutrition"
  | "fitness_light"
  | "fitness_full"
  | "sleep_light"
  | "dopamine"
  | "caffeine"
  | "recovery"
  | "circadian";

type PanelConfig = {
  id: PanelId;
  title: string;
  rsids: string[];
  focus: string;
};

type RsidEntry = {
  genotype: string;
  rawLine: string | null;
};

const RSID_LABELS: Record<string, string> = {
  // Methylation / detox
  rs1801133: "MTHFR C677T",
  rs1801131: "MTHFR A1298C",
  rs4680: "COMT Val158Met",
  rs234706: "MTRR",
  rs1805087: "MTR",
  rs2851391: "BHMT",
  rs7946: "PEMT",

  // Nutrition / weight
  rs9939609: "FTO",
  rs1558902: "FTO appetite",
  rs7903146: "TCF7L2",
  rs17782313: "MC4R",
  rs662799: "APOA5",

  // Fitness / performance
  rs1815739: "ACTN3 R577X",
  rs1042713: "ADRB2",
  rs1042714: "ADRB2",
  rs4253778: "PPARGC1A",

  // Sleep / circadian
  rs1801260: "CLOCK 3111T/C",
  rs5751876: "ADORA2A caffeine & sleep",

  // Dopamine / mood
  rs4685: "COMT",
  rs6269: "COMT",
  rs6323: "MAOA",

  // Caffeine / stimulant
  rs762551: "CYP1A2 caffeine metabolism",

  // Recovery / inflammation
  rs1800795: "IL6",
  rs1143627: "IL1B",
  rs2243250: "IL4",
};

const PANELS: Record<PanelId, PanelConfig> = {
  methylation: {
    id: "methylation",
    title: "Methylation & Detox",
    rsids: ["rs1801133", "rs1801131", "rs4680", "rs234706", "rs1805087"],
    focus:
      "folate cycle, methylation efficiency, detox workload, and stress handling tendencies (non-medical).",
  },
  nutrition: {
    id: "nutrition",
    title: "Nutrition & Weight",
    rsids: ["rs9939609", "rs1558902", "rs7903146", "rs17782313", "rs662799"],
    focus:
      "appetite, carb/fat response, easy-gainer vs hard-gainer vibes, and general weight management style.",
  },
  fitness_light: {
    id: "fitness_light",
    title: "Fitness & Movement (Light)",
    rsids: ["rs1815739"],
    focus:
      "basic power vs endurance tendencies and movement style, suitable for a general-audience wellness report.",
  },
  fitness_full: {
    id: "fitness_full",
    title: "Performance & Training",
    rsids: ["rs1815739", "rs1042713", "rs1042714", "rs4253778"],
    focus:
      "training style, power vs endurance, cardio vs strength, and adaptation to heavier training loads.",
  },
  sleep_light: {
    id: "sleep_light",
    title: "Sleep & Recovery (Light)",
    rsids: ["rs1801260"],
    focus:
      "morning vs night energy tendencies and general sleep rhythm awareness.",
  },
  dopamine: {
    id: "dopamine",
    title: "Dopamine, Focus & Drive",
    rsids: ["rs4680", "rs4685", "rs6269", "rs6323"],
    focus:
      "motivation, reward sensitivity, focus, and stress reactivity in a playful, non-clinical way.",
  },
  caffeine: {
    id: "caffeine",
    title: "Caffeine & Stimulant Response",
    rsids: ["rs762551", "rs5751876"],
    focus:
      "how they might respond to coffee, energy drinks, and late-day caffeine (no health claims).",
  },
  recovery: {
    id: "recovery",
    title: "Recovery & Inflammation",
    rsids: ["rs1800795", "rs1143627", "rs2243250"],
    focus:
      "how quickly or slowly they might bounce back from stressors and training loads.",
  },
  circadian: {
    id: "circadian",
    title: "Circadian & Light Exposure",
    rsids: ["rs1801260"],
    focus:
      "light sensitivity, morning vs evening preference, and who might enjoy cold/light routines.",
  },
};

const PACKAGE_PANELS: Record<string, PanelId[]> = {
  tease: [],
  core: ["methylation", "nutrition", "fitness_light", "sleep_light"],
  premium: [
    "methylation",
    "nutrition",
    "fitness_full",
    "dopamine",
    "caffeine",
    "recovery",
    "circadian",
  ],
  ultimate: [
    "methylation",
    "nutrition",
    "fitness_full",
    "dopamine",
    "caffeine",
    "recovery",
    "circadian",
    "sleep_light",
  ],
};

// Build one panel section text block
function buildPanelBlock(
  panel: PanelConfig,
  rsidMap: Record<string, RsidEntry>
): string {
  const lines: string[] = [];
  lines.push(`### ${panel.title}`);
  lines.push(`Focus: ${panel.focus}`);
  lines.push("");
  lines.push("Key SNPs:");

  for (const rsid of panel.rsids) {
    const label = RSID_LABELS[rsid] ?? rsid;
    const found = rsidMap[rsid];

    if (found) {
      lines.push(`- ${rsid} (${label}): ${found.genotype}`);
    } else {
      lines.push(
        `- ${rsid} (${label}): not found in this file (or not reported by this lab)`
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body. Expected pkg, sampleLines, totalCount, rsidMap." },
        { status: 400 }
      );
    }

    const pkgRaw = (body.pkg || "tease").toString();
    const pkg = pkgRaw.toLowerCase();
    const sampleLines = Array.isArray(body.sampleLines) ? body.sampleLines : [];
    const totalCount =
      typeof body.totalCount === "number" ? body.totalCount : sampleLines.length;
    const rsidMap: Record<string, RsidEntry> = body.rsidMap || {};

    const sampleCount = sampleLines.length;

    const panelIdsForPkg = PACKAGE_PANELS[pkg] ?? [];

    let panelSections = "";
    if (panelIdsForPkg.length > 0) {
      const sections: string[] = [];
      for (const panelId of panelIdsForPkg) {
        const panel = PANELS[panelId];
        if (!panel) continue;
        sections.push(buildPanelBlock(panel, rsidMap));
      }
      panelSections = sections.join("\n");
    }

    let pkgDescription = "";
    let pkgInstructions = "";

    if (pkg === "tease") {
      pkgDescription = `DNA Tease is a fun, social-friendly mini reading. It is NOT a serious wellness or medical report.`;

      pkgInstructions = `
- Tone: playful, witty, screenshot-ready.
- Length: ~250–400 words.
- Structure:
  1) Short, punchy Summary (1–2 sentences).
  2) "What your DNA sample hints at" – quirky personality / lifestyle vibes.
  3) A few bullet points that feel shareable/fun.
- DO NOT talk about serious health risks, disease, or anything heavy.
- Make it clear this is based on a tiny subset of the file, just for fun.
`;
    } else if (pkg === "core") {
      pkgDescription = `The Wellness Core report is a mid-level wellness blueprint. It should feel like a friendly, simple alternative to DNA wellness products — focused on general tendencies, not diagnoses.`;

      pkgInstructions = `
- Use the panel sections (methylation, nutrition, fitness_light, sleep_light) as your main anchor.
- Length: ~700–1200 words.
- Suggested structure:
  1) Overview Summary – 2–3 sentences.
  2) Methylation & Detox.
  3) Nutrition & Weight Style.
  4) Fitness & Recovery (light).
  5) Sleep & Daily Rhythm (light).
  6) Gentle lifestyle-style ideas (no prescriptions, no guarantees).
- Explicitly state:
  - This is entertainment/education.
  - It is based on a limited consumer DNA upload and a small panel, not a clinical test.
`;
    } else if (pkg === "premium") {
      pkgDescription = `The Biohacker Pack is aimed at gym rats, productivity geeks, and health-obsessed people who want more knobs to tweak. It builds on Wellness Core but goes deeper into performance and routine design.`;

      pkgInstructions = `
- Use all included panels as your backbone (methylation, nutrition, fitness_full, dopamine, caffeine, recovery, circadian).
- Length: ~1200–2000 words.
- Suggested structure:
  1) High-level Summary – highlight this as an "optimization playground".
  2) Training & Muscle Response (ACTN3 + related markers).
  3) Dopamine, Focus & Drive (COMT + dopamine-related markers).
  4) Nutrition & Metabolism tendencies.
  5) Recovery, Inflammation & Hydration.
  6) Caffeine & Stimulant Response (CYP1A2 etc.).
  7) Circadian & Light / Cold Exposure.
  8) Epigenetic-Friendly Levers & Experiments (clear, specific, gentle).
  9) 90-Day Biohacker Game Plan (Phase 1–3).
- Never promise outcomes, cure, or prevention. Always frame as experiments and tendencies.
`;
    } else if (pkg === "ultimate") {
      pkgDescription = `The Ultimate / Life Plan report is your "compete with LifeDNA" tier. It should feel like a premium, multi-section blueprint covering methylation, nutrition, fitness, sleep, recovery and mood into one DNA-informed life strategy.`;

      pkgInstructions = `
- Use ALL panel sections (everything provided) as your core foundation.
- Length: ~1800–2800 words (you can be more detailed).
- Suggested structure:
  1) Big Picture Summary – 3–5 sentences tying together main themes.
  2) Methylation & Detox (MTHFR/COMT, etc.).
  3) Nutrition & Weight Management.
  4) Vitamins & Supplement-style insights (conceptual; no dosages).
  5) Fitness, Performance & Recovery.
  6) Sleep & Circadian Rhythms.
  7) Dopamine, Focus, Motivation & Stress Style.
  8) Caffeine & Stimulant Response.
  9) Practical Lifestyle & Habit Ideas (organized in bullet lists).
  10) 90-Day Life Plan – phased approach (Foundation, Optimization, Refinement).
- Make it feel premium but still fun and accessible.
- Constantly remind:
  - This is NOT medical advice.
  - It is based on a limited gene panel from a consumer DNA service, not a diagnostic lab.
`;
    } else {
      pkgDescription = `Unknown package. Treat it like a fun mini-report similar to DNA Tease.`;
      pkgInstructions = `
- Short, playful, clearly non-medical.
- Mention that it's based on a limited sample of the DNA file.
`;
    }

    const systemPrompt = `
You are "GeneGenie", a playful but smart DNA wellness interpreter.
You:
- Use fun, friendly, slightly nerdy language.
- Are VERY clear that this is NOT medical advice, diagnosis, or treatment.
- Avoid disease names, risk percentages, or prescriptive dosing.
- Talk about "tendencies", "vibes", "experiments", and "things to be mindful of".
- Encourage users to talk to qualified health professionals for real decisions.
Use headings and bullet points when helpful.
`;

    const panelsText =
      panelSections ||
      "(No gene panels were provided for this package; base your interpretation on the sample description and DNA SAMPLE block only.)";

    const dnaSampleSection = `
DNA SAMPLE (first ${sampleCount} of ~${totalCount} data lines – just for flavor)
-------------------
${sampleLines.join("\n")}
-------------------
`;

    const userPrompt = `
User selected package: "${pkgRaw}".

PACKAGE DESCRIPTION:
${pkgDescription}

PACKAGE-SPECIFIC INSTRUCTIONS:
${pkgInstructions}

GENE PANELS FOR THIS PACKAGE (extracted by scanning the FULL DNA file on the client and sending key SNPs only):
${panelsText}

${dnaSampleSection}

Your job:
- Follow the package-specific instructions.
- If gene panels are provided, use them as the primary anchor.
- Do NOT invent genotypes; if something is marked as "not found", treat it as unknown.
- Be playful and encouraging, but always remind the user that this is entertainment/education only.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 1200,
    });

    let reportText = "";
    const choice = completion.choices[0];

    if (choice?.message?.content) {
      const content = choice.message.content as any;
      if (typeof content === "string") {
        reportText = content.trim();
      } else if (Array.isArray(content)) {
        reportText = content
          .map((part: any) =>
            typeof part === "string"
              ? part
              : typeof part?.text === "string"
              ? part.text
              : ""
          )
          .join("")
          .trim();
      }
    }

    if (!reportText) {
      return NextResponse.json(
        {
          error: "Model did not return any text. Please try again.",
          raw: completion,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        report: reportText,
        meta: {
          model: completion.model,
          usage: completion.usage,
          pkg,
          totalLines: totalCount,
          panelsUsed: panelIdsForPkg,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /api/upload:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Unexpected server error while processing your DNA.",
      },
      { status: 500 }
    );
  }
}
