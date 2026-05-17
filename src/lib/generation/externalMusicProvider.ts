import type { MusicProvider } from "@/lib/generation/MusicProvider";

export const externalMusicProvider: MusicProvider = {
  async generate(input) {
    const apiUrl = process.env.MUSIC_PROVIDER_API_URL;
    const apiKey = process.env.MUSIC_PROVIDER_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("External music provider is not configured.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: input.prompt,
        durationSeconds: input.durationSeconds
      })
    });

    if (!response.ok) {
      throw new Error("Music provider request failed.");
    }

    const data = await response.json() as { id: string; audioUrl: string; title?: string };

    return {
      id: data.id,
      audioUrl: data.audioUrl,
      title: data.title ?? "Generated Reading Theme",
      description: input.prompt,
      durationSeconds: input.durationSeconds,
      generationStatus: "complete",
      createdAt: new Date().toISOString(),
      sourceBookTitle: input.sourceBookTitle,
      sourceAuthor: input.sourceAuthor
    };
  }
};
