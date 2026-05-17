const BLOCKED_ARTIST_PATTERNS = [
  /Taylor Swift/gi,
  /BTS/gi,
  /Billie Eilish/gi,
  /IU/gi,
  /Adele/gi,
  /Radiohead/gi
];

export type ArtistRewriteResult = {
  rewrittenPrompt: string;
  wasRewritten: boolean;
};

export function rewriteArtistImitation(prompt: string): ArtistRewriteResult {
  let rewrittenPrompt = prompt;
  let wasRewritten = false;

  for (const pattern of BLOCKED_ARTIST_PATTERNS) {
    if (pattern.test(rewrittenPrompt)) {
      rewrittenPrompt = rewrittenPrompt.replace(pattern, "a non-imitative contemporary music style");
      wasRewritten = true;
    }
  }

  return {
    rewrittenPrompt,
    wasRewritten
  };
}
