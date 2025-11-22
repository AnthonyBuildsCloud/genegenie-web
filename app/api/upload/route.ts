import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const pkg = formData.get("pkg") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read the raw DNA file contents as text
    const text = await file.text();

    // For now we just fake a "report" response.
    // Later we’ll call OpenAI here using `text` + `pkg`.
    console.log("Received DNA file for package:", pkg);
    console.log("First 200 chars of DNA file:", text.slice(0, 200));

    return NextResponse.json({
      ok: true,
      pkg,
      preview: text.slice(0, 200),
      message: "DNA received. OpenAI integration comes next.",
    });
  } catch (err) {
    console.error("Error in /api/upload:", err);
    return NextResponse.json(
      { error: "Server error while processing DNA" },
      { status: 500 }
    );
  }
}
