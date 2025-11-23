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

    const systemPrompt = `
You are "GeneGenie", a playful but smart DNA wellness interpreter.
You speak in fun, friendly language, but you are very clear that this is NOT medical advice.
Keep responses concise but flavorful. 
`;

    const userPrompt = `
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

    // Use a stable chat model (gpt-4o-mini) with chat completions
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 600,
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
