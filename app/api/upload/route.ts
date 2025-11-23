import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const pkg = (formData.get("pkg") || "tease").toString();

    // Make sure we got a file we can read as text
    if (!file || typeof (file as any).text !== "function") {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const dnaText = await (file as any).text();

    // Normalize package name
    const normalizedPkg = pkg.toLowerCase();

    // Package-specific flavor & depth
    let pkgDescription = "";
    let pkgInstructions = "";

    if (normalizedPkg === "tease") {
      pkgDescription = `This is the free DNA Tease experience. It should feel like a fun, social, personality-focused mini reading.`;
      pkgInstructions = `
- Tone: playful, witty, social-media-ready. Imagine something people might screenshot and share.
- Focus on 3–5 quirky personality / lifestyle vibes suggested by the DNA lines.
- You can mention things like "midnight snacker gene", "dad-jokes susceptibility", "Netflix binger potential", etc., but keep it obviously playful.
- Overall structure:
  1) Short, punchy Summary (1–2 sentences)
  2) Genotypes I see (just list what appears in the file)
  3) What this might mean (playful): 3–5 bullet points of fun traits.
- Keep it fairly short (2–4 short paragraphs or bullets total).
`;
    } else if (normalizedPkg === "core") {
      pkgDescription = `This is The Wellness Core report. It should feel like a general wellness blueprint that could compete with simple DNA wellness products.`;
      pkgInstructions = `
- Assume the report is based on core wellness genes (things like MTHFR, COMT, FTO, ACTN3, CYP1A2, etc.), even if not all are explicitly listed.
- Overall structure (with clear headings):
  1) Summary – 2–3 sentences summarizing overall wellness themes.
  2) Genotypes I see – list what you actually see in the DNA text.
  3) Energy & Recovery – how their genetics might relate to energy level, fatigue, recovery.
  4) Nutrition & Metabolism – appetite, carb/fat tendencies, "hard gainer" vs "easy gainer" vibes.
  5) Mood & Sleep Traits – stress handling, winding down, sleep tendencies.
  6) Gentle Supplement-Style Ideas – very light, non-medical suggestions (e.g., "you might feel best with magnesium-rich foods", "prioritizing protein", etc.).
- Make it feel more substantial than Tease, but still readable and fun.
- Remind them clearly this is NOT medical advice, just entertainment/education based on limited DNA info.
`;
    } else if (normalizedPkg === "premium") {
      pkgDescription = `This is The Biohacker Pack. It should feel like an upgraded version of Wellness Core aimed at gym rats, productivity geeks, and health-obsessed users. It should clearly feel more premium and more actionable than Core, while still leaving room for even bigger future packages.`;
      pkgInstructions = `
- Assume everything in Wellness Core PLUS more performance / optimization depth.
- Target depth: a rich, multi-section narrative that could plausibly feel like a paid report. Think "mini playbook", not just a teaser.
- Overall structure (with clear headings):

  1) Summary – 2–3 sentences highlighting that this is an "optimizer" / "biohacker" style profile.
  2) Genotypes I see – list what you actually see in the DNA text.
  3) Training & Muscle Response – ACTN3-style vibes, power vs endurance, recovery tendencies. Explain how different training styles might feel for them (non-clinical).
  4) Dopamine, Focus & Drive – motivation, reward sensitivity, stress reactivity (non-clinical, but helpful for understanding work / gym mindset).
  5) Recovery, Inflammation & Hydration – how they might respond to hard training, inflammation, hydration habits, electrolytes.
  6) Circadian, Light & Cold Exposure – playful hints about morning vs night energy, who might enjoy cold showers, light routines, etc.
  7) 30-Day Biohacker Game Plan – break this into phases (e.g., Weeks 1–2, Weeks 3–4) with a few simple focus points for each phase:
     - Training focus (e.g., "experiment with 2–3 strength days + 1 conditioning day")
     - Recovery focus (sleep wind-down, stretching, hydration rituals)
     - Lifestyle experiments (sunlight timing, caffeine cutoff, screen habits).
  8) Fun Experiments & Ideas – a bulleted list (8–12 bullets) of specific experiments they could try, phrased as invitations (e.g., "Try a week where you...").

- Keep the language fun and encouraging, but make this noticeably more detailed and structured than the Core report.
- Always repeat that these are playful experiments and lifestyle ideas, NOT prescriptions.
- Emphasize that this is based on a small slice of DNA and should not be treated as medical advice.
`;
    } else {
      // Fallback if an unknown pkg is passed – treat like tease
      pkgDescription = `Unknown package value. Treat this like the fun DNA Tease experience.`;
      pkgInstructions = `
- Keep it short, playful, and clearly non-clinical.
`;
    }

    const systemPrompt = `
You are "GeneGenie", a playful but smart DNA wellness interpreter.
You speak in fun, friendly language, but you are very clear that this is NOT medical advice.
You never sound like a doctor. You sound like a friendly, slightly nerdy guide.
Avoid clinical or diagnostic language. Use headings and bullet points when helpful.
`;

    const userPrompt = `
User has purchased the "${pkg}" package.

PACKAGE DESCRIPTION:
${pkgDescription}

PACKAGE INSTRUCTIONS:
${pkgInstructions}

GENERAL TASK (applies to all packages):
- Acknowledge that this is based on a tiny slice of DNA and is just for fun.
- Clearly list the genotypes you see from the DNA text.
- Then give a playful, non-clinical interpretation fitted to the package level.
- Explicitly remind them this is **not medical advice**, just entertainment/education.

DNA file contents:
-------------------
${dnaText}
-------------------
`;

    // Use a stable chat model (gpt-4o-mini) with chat completions
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 900,
    });

    // Robustly pull out the text from the first choice
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
          pkg: normalizedPkg,
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
