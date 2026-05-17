import type { MusicProvider } from "@/lib/generation/MusicProvider";

export const mockMusicProvider: MusicProvider = {
  async generate(input) {
    return {
      id: `mock-${Date.now()}`,
      audioUrl: "/audio/mock-track.wav",
      title: "Generated Reading Theme",
      description: input.prompt,
      durationSeconds: input.durationSeconds,
      generationStatus: "complete",
      createdAt: new Date().toISOString(),
      sourceBookTitle: input.sourceBookTitle,
      sourceAuthor: input.sourceAuthor
    };
  }
};
