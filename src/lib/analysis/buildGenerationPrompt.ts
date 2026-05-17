import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";
import type { BookContext, GenerationOptions, MusicDescriptionAnalysis } from "@/types/litsound";

type PromptInput = {
  bookContext: BookContext;
  musicDescriptionAnalysis: MusicDescriptionAnalysis;
  options: GenerationOptions;
};

export function buildGenerationPrompt(input: PromptInput): string {
  const { bookContext, musicDescriptionAnalysis, options } = input;
  const lyricInstruction = options.includeLyrics && musicDescriptionAnalysis.lyricSeed
    ? `include original lyrics inspired by: ${musicDescriptionAnalysis.lyricSeed}`
    : "instrumental, no lyrics";

  const basePrompt = [
    `Create a ${options.durationSeconds}-second AI-generated music clip.`,
    `Book context: ${bookContext.title} by ${bookContext.author}, ${bookContext.inferredGenre}, ${bookContext.inferredPeriod}.`,
    `Overall mood: ${bookContext.inferredMood.join(", ")} with ${options.bookMoodWeight} book mood influence.`,
    `Music direction: ${musicDescriptionAnalysis.tempo} tempo, ${musicDescriptionAnalysis.instruments.join(", ")}, ${musicDescriptionAnalysis.mood.join(", ")} mood, ${musicDescriptionAnalysis.vocalStyle}.`,
    `Scene context: ${musicDescriptionAnalysis.sceneContext.join(", ")}.`,
    `Lyrics: ${lyricInstruction}.`,
    `Adjustments: ${options.adjustments.length > 0 ? options.adjustments.join(", ") : "none"}.`,
    "Do not imitate a specific living artist, band, or copyrighted recording."
  ].join(" ");

  return rewriteArtistImitation(basePrompt).rewrittenPrompt;
}
