import { NextResponse } from "next/server";
import { getAIAssessment } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt, jobId ,title} = await req.json();
    const assessment = await getAIAssessment(prompt, jobId,title);
    return NextResponse.json(assessment);
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
  }
}
