import { generateObject } from "ai";
import { PDFParse } from "pdf-parse";
import { geminiFlash } from "@/lib/ai/gemini";
import { ProfileSchema } from "@/lib/ai/schemas";
import { createStatusReporter } from "@/lib/realtime/status";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const channelId = formData.get("statusChannel");

  if (!(file instanceof File)) {
    return Response.json({ error: "No resume file provided" }, { status: 400 });
  }

  const reporter = await createStatusReporter(typeof channelId === "string" ? channelId : null);

  reporter.send("Reading your resume…");
  const buffer = Buffer.from(await file.arrayBuffer());

  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();
  await parser.destroy();

  reporter.send("Extracting skills and experience…");
  const result = await generateObject({
    model: geminiFlash,
    schema: ProfileSchema,
    prompt: `Extract a structured career profile from this resume text.

Infer total years of experience from the work history dates. Use the most senior or most recent role as roleInterest (phrased as the role they'd want next, e.g. "Senior Frontend Engineer"). List 5-8 of the strongest, most relevant skills. Include up to 3 notable projects or achievements if the resume mentions concrete outcomes (metrics, scale, impact) — otherwise leave the array empty. Write preferences as a short inferred note (e.g. remote/onsite, industry) if the resume hints at it, otherwise a brief neutral default.

Resume text:
${text.slice(0, 12000)}`,
  });

  await reporter.close();

  return Response.json({ profile: { ...result.object, source: "resume" as const } });
}
