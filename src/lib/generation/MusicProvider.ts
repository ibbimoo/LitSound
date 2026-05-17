import type { GenerationJob, GenerationStatus } from "@/types/litsound";

export type GenerateMusicInput = {
  prompt: string;
  sourceBookTitle: string;
  sourceAuthor: string;
  durationSeconds: 30 | 60 | 90;
};

export type MusicProvider = {
  start(input: GenerateMusicInput): Promise<GenerationJob>;
  getStatus(taskId: string): Promise<GenerationStatus>;
};
