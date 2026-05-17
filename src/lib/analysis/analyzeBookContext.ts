import type { BookContext } from "@/types/litsound";

type BookContextInput = {
  title: string;
  author: string;
  optionalSummary?: string;
};

export function analyzeBookContext(input: BookContextInput): BookContext {
  const summary = input.optionalSummary?.trim() ?? "";
  const combined = `${input.title} ${input.author} ${summary}`.toLowerCase();

  const inferredMood = new Set<string>();
  if (/(grief|memory|winter|snow|lonely|quiet|old house)/.test(combined)) {
    inferredMood.add("melancholic");
    inferredMood.add("intimate");
  }
  if (/(mystery|murder|detective|secret)/.test(combined)) {
    inferredMood.add("tense");
  }
  if (/(romance|love|letter|wedding)/.test(combined)) {
    inferredMood.add("romantic");
  }
  if (inferredMood.size === 0) {
    inferredMood.add("reflective");
  }

  const inferredGenre = /(literary|grief|memory|quiet)/.test(combined)
    ? "literary fiction"
    : /(mystery|detective|murder)/.test(combined)
      ? "mystery"
      : /(fantasy|kingdom|magic|dragon)/.test(combined)
        ? "fantasy"
        : "general fiction";

  const inferredPeriod = /(victorian|19th|old manor|carriage)/.test(combined)
    ? "historical"
    : "contemporary";

  return {
    title: input.title.trim(),
    author: input.author.trim(),
    optionalSummary: summary,
    inferredGenre,
    inferredMood: Array.from(inferredMood),
    inferredPeriod,
    confidence: summary.length > 20 ? 0.76 : 0.58
  };
}
