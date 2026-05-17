import type { MusicDescriptionAnalysis, Tempo, VocalStyle } from "@/types/litsound";

export function analyzeMusicDescription(rawText: string): MusicDescriptionAnalysis {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const instruments = [
    ["piano", /piano|피아노/],
    ["strings", /strings|violin|cello|현악|바이올린|첼로/],
    ["brass", /brass|trumpet|horn|트럼펫|금관/],
    ["guitar", /guitar|기타/],
    ["drums", /drum|percussion|드럼|타악/]
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(lower))
    .map(([instrument]) => instrument as string);

  const tempo: Tempo = /very slow|느릿느릿|아주 느/.test(lower)
    ? "very slow"
    : /slow|느린|느리게/.test(lower)
      ? "slow"
      : /fast|빠른|빠르게/.test(lower)
        ? "fast"
        : "medium";

  const mood = new Set<string>();
  if (/(sad|lonely|cracked|흐릿|쓸쓸|슬픈)/.test(lower)) mood.add("melancholic");
  if (/(warm|soft|따뜻|부드러운)/.test(lower)) mood.add("warm");
  if (/(dark|tense|어두운|불안)/.test(lower)) mood.add("tense");
  if (mood.size === 0) mood.add("reflective");

  const vocalStyle: VocalStyle = /(sang|song|voice|노래|목소리|불렀)/.test(lower)
    ? /(cracked|rough|쉰)/.test(lower)
      ? "rough vocal"
      : "soft vocal"
    : "instrumental";

  const lyricMatch = text.match(/about ([^.]+?)( while| with|\.|$)/i);
  const lyricsDetected = /(lyric|sang|song about|가사|노래|불렀)/.test(lower);

  return {
    rawText: text,
    styleKeywords: [tempo, ...Array.from(mood), vocalStyle].filter(Boolean),
    instruments: instruments.length > 0 ? instruments : ["piano"],
    tempo,
    mood: Array.from(mood),
    vocalStyle,
    lyricsDetected,
    lyricSeed: lyricMatch?.[1]?.trim() ?? "",
    sceneContext: extractSceneContext(lower),
    confidence: text.length > 40 ? 0.78 : 0.62
  };
}

function extractSceneContext(lower: string): string[] {
  const context: string[] = [];
  if (/old room|old house|낡은 방|오래된 집/.test(lower)) context.push("old interior");
  if (/sea|ocean|바다/.test(lower)) context.push("sea memory");
  if (/bar|pub|술집/.test(lower)) context.push("small bar");
  return context.length > 0 ? context : ["unspecified scene"];
}
