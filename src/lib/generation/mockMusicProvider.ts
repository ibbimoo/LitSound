import type { MusicProvider } from "@/lib/generation/MusicProvider";
import type { GenerateMusicInput } from "@/lib/generation/MusicProvider";

let lastInput: GenerateMusicInput | null = null;

export const mockMusicProvider: MusicProvider = {
  async start(input) {
    lastInput = input;
    return {
      taskId: "mock-task",
      status: "processing"
    };
  },

  async getStatus(taskId) {
    return {
      taskId,
      status: "complete",
      track: {
        id: "mock-track",
        audioUrl: "/audio/mock-track.wav",
        title: "Generated Reading Theme",
        description: lastInput?.prompt ?? "Mock generated reading theme",
        durationSeconds: lastInput?.durationSeconds ?? 60,
        generationStatus: "complete",
        createdAt: new Date().toISOString(),
        sourceBookTitle: lastInput?.sourceBookTitle ?? "Mock Book",
        sourceAuthor: lastInput?.sourceAuthor ?? "Mock Author"
      }
    };
  }
};
