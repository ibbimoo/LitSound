import { describe, expect, it } from "vitest";
import { POST as generatePost } from "../../app/api/generate/route";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";
import { mockMusicProvider } from "@/lib/generation/mockMusicProvider";

describe("mockMusicProvider", () => {
  it("returns a complete generated track", async () => {
    const track = await mockMusicProvider.generate({
      prompt: "slow piano, melancholic mood",
      sourceBookTitle: "The Winter Archive",
      sourceAuthor: "Mina Park",
      durationSeconds: 60
    });

    expect(track.generationStatus).toBe("complete");
    expect(track.audioUrl).toBe("/audio/mock-track.wav");
    expect(track.sourceBookTitle).toBe("The Winter Archive");
  });
});

describe("getMusicProvider", () => {
  it("uses mock provider by default", () => {
    expect(getMusicProvider("mock")).toBe(mockMusicProvider);
  });
});

describe("generation API route", () => {
  it("returns a generated track with source metadata", async () => {
    const response = await generatePost(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "instrumental slow piano",
          sourceBookTitle: "Sea Memory",
          sourceAuthor: "J. Han",
          durationSeconds: 30
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.track.sourceBookTitle).toBe("Sea Memory");
    expect(body.track.sourceAuthor).toBe("J. Han");
    expect(body.track.durationSeconds).toBe(30);
  });
});
