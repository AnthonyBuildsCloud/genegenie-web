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

const BASE_SYSTEM_PROMPT = `You are "GeneGenie", a playful but smart DNA wellness interpreter.

You:
- Use fun, friendly, slightly nerdy language.
- Are VERY clear that this is NOT medical advice, diagnosis, or treatment.
- Avoid disease names, risk percentages, or prescriptive dosing.
- Talk about "tendencies", "vibes", "experiments", and "things to be mindful of".
- Encourage users to talk to qualified health professionals for real decisions.
- Never invent genotypes or markers. If something is marked as "not found" or absent, treat it as unknown and say so clearly.
- When helpful, connect dots between different sections (e.g. how sleep, caffeine, and dopamine style interact).
- Use clear headings, bullet points, and occasional tables to make the report feel polished and "PDF ready".`;

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

function extractTextFromChoice(choice: any): string {
  if (!choice?.message) return "";
  const content = choice.message.content as any;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
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
  if (typeof content?.text === "string") return content.text.trim();
  return "";
}

// -------- SECTIONED GENERATION FOR ULTIMATE (generic helper) -------- //

async function generateUltimateSection(opts: {
  sectionName: string;
  heading: string;
  instructions: string;
  sharedContext: string;
}): Promise<string> {
  const { sectionName, heading, instructions, sharedContext } = opts;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 900,
      messages: [
        { role: "system", content: BASE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${sharedContext}

You are now writing ONLY the section called "${heading}" of a larger DNA wellness report.

Section rules:
- Start with the markdown heading "${heading}".
- Stay focused on this section only; don't repeat other sections.
- Follow these extra instructions for this section:
${instructions}

Write the full text for this one section now.`,
        },
      ],
    });

    const text = extractTextFromChoice(completion.choices[0]);
    if (!text) {
      return `${heading}\n(Content could not be generated.)\n`;
    }
    return text;
  } catch (err) {
    console.error(`Error generating section "${sectionName}":`, err);
    return `${heading}\n(Content could not be generated due to a server error.)\n`;
  }
}

// -------- ULTIMATE REPORT (already working) -------- //

async function generateUltimateReport(
  pkgRaw: string,
  panelsText: string,
  dnaSampleSection: string
): Promise<string> {
  const sharedContext = `User selected package: "${pkgRaw}" (Ultimate Life Plan).

GENE PANELS FOR THIS PACKAGE:
${panelsText}

${dnaSampleSection}

Remember: this is a premium, non-medical, entertainment/education DNA wellness report.`;

  const sections: string[] = [];

  // 1) Big Picture
  sections.push(
    await generateUltimateSection({
      sectionName: "big_picture",
      heading: "## Big Picture Summary",
      sharedContext,
      instructions: `- 3–5 sentences summarising the main themes across methylation, nutrition, fitness, sleep, dopamine, caffeine and recovery.
- Mention that this is based on limited consumer DNA data and real-world feedback matters more.
- Tone: premium but warm, not fluffy.`,
    })
  );

  // 2) Methylation & Detox
  sections.push(
    await generateUltimateSection({
      sectionName: "methylation",
      heading: "## Methylation & Detox",
      sharedContext,
      instructions: `- Use rs1801133, rs1801131, rs4680, rs234706, rs1805087 IF present in the panel text.
- Structure: short overview paragraph, bullet list referencing actual rsIDs & genotypes (only if present), then a "How to work with this" subheading with 4–7 practical, non-medical ideas.
- Emphasise tendencies, not problems.`,
    })
  );

  // 3) Nutrition & Weight
  sections.push(
    await generateUltimateSection({
      sectionName: "nutrition",
      heading: "## Nutrition & Weight Management",
      sharedContext,
      instructions: `- Use rs9939609, rs1558902, rs7903146, rs17782313, rs662799 where present.
- Cover appetite, carb/fat response, easy-gainer vs hard-gainer vibes.
- Include a "How to work with this" mini list with specific, experiment-style ideas.`,
    })
  );

  // 4) Fitness, Performance & Recovery
  sections.push(
    await generateUltimateSection({
      sectionName: "fitness",
      heading: "## Fitness, Performance & Recovery",
      sharedContext,
      instructions: `- Use rs1815739, rs1042713, rs1042714, rs4253778, plus recovery/inflammation markers when present.
- Talk about power vs endurance tendencies, adaptation to training loads, and general recovery style.
- Add concrete training experiments (e.g. rep schemes, cardio styles) but no medical/rehab advice.`,
    })
  );

  // 5) Sleep & Circadian
  sections.push(
    await generateUltimateSection({
      sectionName: "sleep",
      heading: "## Sleep & Circadian Rhythms",
      sharedContext,
      instructions: `- Use CLOCK / rs1801260 and any other sleep-related markers mentioned in the panels.
- Cover morning vs evening preference and light habits.
- Include a short list of practical sleep/lighting experiments.`,
    })
  );

  // 6) Dopamine, Focus & Motivation
  sections.push(
    await generateUltimateSection({
      sectionName: "dopamine",
      heading: "## Dopamine, Focus & Motivation",
      sharedContext,
      instructions: `- Use COMT and MAOA markers from the panels when present.
- Discuss motivation style, focus, reward sensitivity, and stress reactivity (non-clinical).
- Finish with 4–7 experiment-style ideas for structuring work, breaks, and hobbies.`,
    })
  );

  // 7) Caffeine & Stimulant Response
  sections.push(
    await generateUltimateSection({
      sectionName: "caffeine",
      heading: "## Caffeine & Stimulant Response",
      sharedContext,
      instructions: `- Use rs762551 and ADORA2A panel info if present.
- Describe likely tendencies for caffeine metabolism and sleep sensitivity in playful, non-medical language.
- Add a few sample experiments across morning / mid-day / no-late-afternoon caffeine.`,
    })
  );

  // 8) Practical Lifestyle & Habit Ideas
  sections.push(
    await generateUltimateSection({
      sectionName: "lifestyle",
      heading: "## Practical Lifestyle & Habit Ideas",
      sharedContext,
      instructions: `- Pull everything together into a simple playbook: daily habits, weekly rhythms, and monthly check-ins.
- Use bullet points and subheadings like "Daily Habits", "Weekly Experiments", "Quarterly Reflections".
- Make it feel like a game plan the user can actually follow.
- End the FINAL paragraph of this section with the exact sentence: "For entertainment and educational purposes only. This is not medical advice."`,
    })
  );

  const title = "# The Ultimate Life Plan Report\n";
  return [title, ...sections].join("\n\n");
}

// -------- NEW: PREMIUM / BIOHACKER MULTI-SECTION REPORT -------- //

async function generatePremiumReport(
  pkgRaw: string,
  panelsText: string,
  dnaSampleSection: string
): Promise<string> {
  const sharedContext = `User selected package: "${pkgRaw}" (Biohacker Pack / Premium).

GENE PANELS FOR THIS PACKAGE:
${panelsText}

${dnaSampleSection}

Remember: this is a non-medical, biohacker-style entertainment/education DNA wellness report aimed at lifters, gym rats, productivity nerds, and wellness hackers.`;

  const sections: string[] = [];

  // 1) High-Level Summary
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_high_level",
      heading: "## 🚀 High-Level Summary",
      sharedContext,
      instructions: `- Provide a short table or bullet list summarising key genes/alleles and friendly takeaways.
- Add 4–6 "Top themes" that capture training style, dopamine/focus style, nutrition tendencies, recovery vibe, caffeine rhythm, and circadian notes.
- Tone: energetic, "biohacker newsletter" style, but still non-medical.`,
    })
  );

  // 2) Training & Muscle Response
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_training",
      heading: "## 🏋️ Training & Muscle Response",
      sharedContext,
      instructions: `- Use ACTN3, ADRB2, PPARGC1A and recovery markers where present.
- Explain power vs endurance tendencies, adaptation to volume/intensity, and how fat-mobilisation / cardio style might feel.
- Provide practical training guidance: base-building, power/speed blocks, rep ranges, and example weekly splits (no rehab/medical advice).`,
    })
  );

  // 3) Dopamine & Focus
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_dopamine",
      heading: "## ⚡ Dopamine & Focus: Your Motivation Circuitry",
      sharedContext,
      instructions: `- Use COMT and MAOA-related markers where present.
- Describe motivation style, focus style, reward sensitivity, and stress reactivity in non-clinical language.
- Include a bullet list of 4–7 experiment ideas for focus blocks, break timing, novelty, and habits that support your dopamine style.`,
    })
  );

  // 4) Nutrition & Metabolism
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_nutrition",
      heading: "## 🥑 Nutrition & Metabolism: Your Dietary Tune-Up",
      sharedContext,
      instructions: `- Use FTO, TCF7L2, MC4R, APOA5 and related markers when present.
- Discuss appetite signalling, carb vs fat response, easy-gainer vs hard-gainer feel, and triglyceride / fat-handling tendencies.
- Include either a small table or neat bullet list mapping genes to friendly meanings.
- Finish with practical experiment ideas: carb timing, fat types, satiety strategies, and pre/post-workout fuel ideas.`,
    })
  );

  // 5) Recovery & Inflammation
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_recovery",
      heading: "## 🛌 Recovery & Inflammation: How You Bounce Back",
      sharedContext,
      instructions: `- Use IL6, IL1B, IL4 style markers where present as mild tendencies.
- Describe soreness pattern, bounce-back time, and how hard sessions might feel.
- Suggest non-medical biohacker tactics: deload weeks, active recovery, sleep, nutrition, and stress management experiments.`,
    })
  );

  // 6) Caffeine & Stimulant Response
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_caffeine",
      heading: "## ☕ Caffeine & Stimulant Response",
      sharedContext,
      instructions: `- Use CYP1A2 and ADORA2A panel info where present.
- Describe likely tendencies for caffeine clearance and jitter/sleep sensitivity as playful tendencies.
- Provide experiments: morning-only caffeine, micro-doses vs big doses, pre-workout timing, and stimulant-free days.`,
    })
  );

  // 7) Circadian Rhythm, Light & Routines
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_circadian",
      heading: "## 🌞 Circadian Rhythm, Light & Daily Routines",
      sharedContext,
      instructions: `- Use CLOCK and any related circadian markers present.
- Discuss likely leaning toward morning or evening energy, and how light exposure and screen use might interact.
- Give specific suggestions for light exposure, possible cold exposure timing (if appropriate), and anchor habits (wake time, meal timing, wind-down routines).`,
    })
  );

  // 8) Epigenetic-Friendly Experiments
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_epigenetic",
      heading: "## 🧬 Epigenetic-Friendly Experiments & Knobs to Tweak",
      sharedContext,
      instructions: `- Create a compact table or bullet list of experiment ideas grouped by area:
  (Methylation & Detox, Training, Nutrition, Dopamine & Focus, Recovery, Caffeine, Circadian).
- For each, give 1–2 sentences about why it might be fun or useful to try.
- Emphasise experimentation, tracking, and listening to real-world feedback over genetic determinism.`,
    })
  );

  // 9) 90-Day Biohacker Game Plan (with disclaimer)
  sections.push(
    await generateUltimateSection({
      sectionName: "bio_90day",
      heading: "## 🎯 90-Day Biohacker Game Plan",
      sharedContext,
      instructions: `- Turn all prior sections into a simple 90-day roadmap: Phase 1 (Weeks 1–4), Phase 2 (Weeks 5–8), Phase 3 (Weeks 9–12).
- Include suggestions for what to focus on each phase (training tweaks, nutrition experiments, sleep/light changes, dopamine/focus habits).
- Keep it non-medical and framed as optional experiments, not prescriptions.
- END the final paragraph of this section with the exact sentence: "For entertainment and educational purposes only. This is not medical advice."`,
    })
  );

  const title = "# Your Biohacker Pack DNA Deep-Dive\n";
  return [title, ...sections].join("\n\n");
}

// -------- MAIN HANDLER -------- //

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          error:
            "Invalid JSON body. Expected pkg, sampleLines, totalCount, rsidMap.",
        },
        { status: 400 }
      );
    }

    const pkgRaw = (body.pkg || "tease").toString();
    const pkg = pkgRaw.toLowerCase();

    const sampleLines = Array.isArray(body.sampleLines)
      ? (body.sampleLines as string[])
      : [];
    const totalCount =
      typeof body.totalCount === "number"
        ? (body.totalCount as number)
        : sampleLines.length;
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

    const panelsText =
      panelSections ||
      "(No gene panels were provided for this package; base your interpretation on the panel description only.)";

    const dnaSampleSection =
      sampleCount > 0
        ? `DNA SAMPLE (first ${sampleCount} of ~${totalCount} data lines – just for flavor)
-------------------
${sampleLines.join("\n")}
-------------------`
        : "No sample lines were provided.";

    // ---- Ultimate: multi-section generation to avoid truncation ----
    if (pkg === "ultimate") {
      const fullReport = await generateUltimateReport(
        pkgRaw,
        panelsText,
        dnaSampleSection
      );

      return NextResponse.json(
        {
          report: fullReport,
          meta: {
            model: "gpt-4.1-mini",
            pkg,
            totalLines: totalCount,
            panelsUsed: panelIdsForPkg,
            mode: "multi-section-ultimate",
          },
        },
        { status: 200 }
      );
    }

    // ---- NEW: Premium/Biohacker: multi-section generation ----
    if (pkg === "premium") {
      const fullReport = await generatePremiumReport(
        pkgRaw,
        panelsText,
        dnaSampleSection
      );

      return NextResponse.json(
        {
          report: fullReport,
          meta: {
            model: "gpt-4.1-mini",
            pkg,
            totalLines: totalCount,
            panelsUsed: panelIdsForPkg,
            mode: "multi-section-premium",
          },
        },
        { status: 200 }
      );
    }

    // ---- Other packages: single-shot generation (tease, core, fallback) ----
    let pkgDescription = "";
    let pkgInstructions = "";

    if (pkg === "tease") {
      pkgDescription =
        "DNA Tease is a fun, social-friendly mini reading. It is NOT a serious wellness or medical report.";
      pkgInstructions =
        "- Tone: playful, witty, screenshot-ready.\n" +
        "- Length: ~250–400 words.\n" +
        '- Structure: 1) Short, punchy Summary. 2) Fun personality / lifestyle vibes. 3) A few shareable bullet points.\n' +
        "- Do NOT talk about serious health risks or disease.\n" +
        "- Make it clear this is based on a tiny subset of the file, just for fun.\n";
    } else if (pkg === "core") {
      pkgDescription =
        "The Wellness Core report is a mid-level wellness blueprint. It should feel like a friendly, simple alternative to DNA wellness products — focused on general tendencies, not diagnoses.";
      pkgInstructions =
        "- Use methylation, nutrition, fitness_light, and sleep_light panels as the backbone.\n" +
        "- Length: ~800–1300 words.\n" +
        "- Structure: Overview, then sections for Methylation & Detox, Nutrition & Weight Style, Fitness & Recovery (light), Sleep & Daily Rhythm, and a short lifestyle ideas section.\n" +
        "- Explicitly state that this is entertainment/education and based on limited consumer DNA data.\n";
    } else {
      // Any other / unknown package falls back to a playful mini-report
      pkgDescription =
        "Unknown package. Treat it like a short, playful mini-report similar to DNA Tease.";
      pkgInstructions =
        "- Short, playful, clearly non-medical.\n" +
        "- Mention that it's based on a limited sample of the DNA file.\n";
    }

    const userPrompt = `User selected package: "${pkgRaw}". 

PACKAGE DESCRIPTION:
${pkgDescription}

PACKAGE-SPECIFIC INSTRUCTIONS:
${pkgInstructions}

GENE PANELS FOR THIS PACKAGE:
${panelsText}

${dnaSampleSection}

Your job:
- Follow the package-specific instructions.
- Use the panel sections as the primary anchor.
- Do NOT invent genotypes; if something is marked as "not found" or is absent, treat it as unknown.
- Be playful and encouraging, but always remind the user that this is entertainment and education only, not medical advice.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 2000,
      messages: [
        { role: "system", content: BASE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const reportText = extractTextFromChoice(completion.choices[0]);

    if (!reportText) {
      return NextResponse.json(
        {
          error: "Model did not return any text. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        report: reportText.trim(),
        meta: {
          model: "gpt-4.1-mini",
          pkg,
          totalLines: totalCount,
          panelsUsed: panelIdsForPkg,
          mode: "single-shot",
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
