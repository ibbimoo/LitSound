export type Tempo = "very slow" | "slow" | "medium" | "fast" | "very fast";

export type VocalStyle =
  | "instrumental"
  | "soft vocal"
  | "clear vocal"
  | "whispered vocal"
  | "rough vocal"
  | "choir";

export type BookContext = {
  title: string;
  author: string;
  optionalSummary: string;
  inferredGenre: string;
  inferredMood: string[];
  inferredPeriod: string;
  confidence: number;
};

export type MusicDescriptionAnalysis = {
  rawText: string;
  styleKeywords: string[];
  instruments: string[];
  tempo: Tempo;
  mood: string[];
  vocalStyle: VocalStyle;
  lyricsDetected: boolean;
  lyricSeed: string;
  sceneContext: string[];
  confidence: number;
};

export type GenerationOptions = {
  includeLyrics: boolean;
  durationSeconds: 30 | 60 | 90;
  adjustments: string[];
  bookMoodWeight: "low" | "medium" | "high";
};

export type GenerationRequest = {
  bookContext: BookContext;
  musicDescriptionAnalysis: MusicDescriptionAnalysis;
  options: GenerationOptions;
  prompt: string;
};

export type GeneratedTrack = {
  id: string;
  audioUrl: string;
  title: string;
  description: string;
  durationSeconds: number;
  generationStatus: "queued" | "processing" | "complete" | "failed";
  createdAt: string;
  sourceBookTitle: string;
  sourceAuthor: string;
};
