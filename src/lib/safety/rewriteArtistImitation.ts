const BLOCKED_ARTIST_PATTERNS = [
  /\bTaylor Swift\b/gi,
  /\bBTS\b/gi,
  /\bBillie Eilish\b/gi,
  /\bIU\b/gi,
  /\bAdele\b/gi,
  /\bRadiohead\b/gi
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
