import type { GeneratedTrack } from "@/types/litsound";

export type GenerateMusicInput = {
  prompt: string;
  sourceBookTitle: string;
  sourceAuthor: string;
  durationSeconds: 30 | 60 | 90;
};

export type MusicProvider = {
  generate(input: GenerateMusicInput): Promise<GeneratedTrack>;
};
