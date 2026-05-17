import { NextResponse } from "next/server";
import { z } from "zod";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";
import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  sourceBookTitle: z.string().min(1),
  sourceAuthor: z.string().min(1),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(90)]).default(60)
});

export async function POST(request: Request) {
  try {
    const body = GenerateRequestSchema.parse(await request.json());
    const safePrompt = rewriteArtistImitation(body.prompt).rewrittenPrompt;
    const provider = getMusicProvider();
    const track = await provider.generate({
      prompt: safePrompt,
      sourceBookTitle: body.sourceBookTitle,
      sourceAuthor: body.sourceAuthor,
      durationSeconds: body.durationSeconds
    });

    return NextResponse.json({ track });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid generation request." },
      { status: 400 }
    );
  }
}
