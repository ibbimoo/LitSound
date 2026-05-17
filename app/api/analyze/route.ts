import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeBookContext } from "@/lib/analysis/analyzeBookContext";
import { analyzeMusicDescription } from "@/lib/analysis/analyzeMusicDescription";
import { buildGenerationPrompt } from "@/lib/analysis/buildGenerationPrompt";
import { sanitizeExcerpt } from "@/lib/safety/sanitizeExcerpt";

const AnalyzeRequestSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  optionalSummary: z.string().default(""),
  excerpt: z.string().min(1),
  includeLyrics: z.boolean().default(false),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(90)]).default(60),
  adjustments: z.array(z.string()).default([]),
  bookMoodWeight: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]).default("medium")
});

export async function POST(request: Request) {
  try {
    const body = AnalyzeRequestSchema.parse(await request.json());
    const excerpt = sanitizeExcerpt(body.excerpt);
    const bookContext = analyzeBookContext({
      title: body.title,
      author: body.author,
      optionalSummary: body.optionalSummary
    });
    const musicDescriptionAnalysis = analyzeMusicDescription(excerpt);
    const prompt = buildGenerationPrompt({
      bookContext,
      musicDescriptionAnalysis,
      options: {
        includeLyrics: body.includeLyrics,
        durationSeconds: body.durationSeconds,
        adjustments: body.adjustments,
        bookMoodWeight: body.bookMoodWeight
      }
    });

    return NextResponse.json({
      bookContext,
      musicDescriptionAnalysis,
      prompt
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid analysis request." },
      { status: 400 }
    );
  }
}
