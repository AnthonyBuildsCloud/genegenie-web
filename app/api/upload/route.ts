
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

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const dnaText = await file.text();

    const prompt = `
You are "GeneGenie", a playful but smart DNA wellness interpreter.

User has purchased the "${pkg}" package.

They uploaded a small test DNA file. It contains one or more fake SNP lines like:

rs123456: A/G
rs987654: C/C

TASK:
- Give a short, fun **Summary** paragraph (1–2 sentences).
- Then list the genotypes you see.
- Then give a playful, non-clinical interpretation ("What this might mean (playful)").
- Make it clear this is **not medical advice** and is based on a tiny teaser sample.

DNA file contents:
-------------------
${dnaText}
-------------------
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt,
      // you can add max_output_tokens here if you want, e.g. 600
    });

    // ---- Robust text extraction from Responses API ----
    const raw: any = response;

    // 1) Use output_text if the SDK gives it to us
    let reportText: string =
      (raw.output_text as string | undefined) ?? "";

    // 2) Fallback: walk over output[].content[] and grab text/text.value
    if (!reportText && Array.isArray(raw.output)) {
      const chunks: string[] = [];

      for (const item of raw.output) {
        const content = item?.content ?? [];
        for (const c of content) {
          if (typeof c.text === "string") {
            chunks.push(c.text);
          } else if (c.text && typeof c.text.value === "string") {
            chunks.push(c.text.value);
          }
        }
      }

      reportText = chunks.join("\n").trim();
    }

    // If we *still* can't find any text, send everything back for debugging
    if (!reportText) {
      console.warn("Could not extract text from Responses API:", raw);
      return NextResponse.json(
        {
          report: null,
          raw: raw,
        },
        { status: 200 }
      );
    }

    // Normal success response
    return NextResponse.json(
      {
        report: reportText,
        meta: {
          model: raw.model,
          usage: raw.usage,
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
