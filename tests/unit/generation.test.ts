import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as generatePost } from "../../app/api/generate/route";
import { GET as generateStatusGet } from "../../app/api/generate/status/route";
import { externalMusicProvider } from "@/lib/generation/externalMusicProvider";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";
import { mockMusicProvider } from "@/lib/generation/mockMusicProvider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("mockMusicProvider", () => {
  it("returns a complete generated track after starting a mock task", async () => {
    const job = await mockMusicProvider.start({
      prompt: "slow piano, melancholic mood",
      sourceBookTitle: "The Winter Archive",
      sourceAuthor: "Mina Park",
      durationSeconds: 60
    });
    const status = await mockMusicProvider.getStatus(job.taskId);

    expect(job.taskId).toBe("mock-task");
    expect(status.status).toBe("complete");
    const track = status.track;
    expect(track).toBeDefined();
    expect(track?.generationStatus).toBe("complete");
    expect(track?.audioUrl).toBe("/audio/mock-track.wav");
    expect(track?.sourceBookTitle).toBe("The Winter Archive");
  });
});

describe("getMusicProvider", () => {
  it("uses mock provider by default", () => {
    expect(getMusicProvider("mock")).toBe(mockMusicProvider);
  });
});

describe("generation API route", () => {
  it("returns a generation task id", async () => {
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
    expect(body.taskId).toBe("mock-task");
    expect(body.status).toBe("processing");
  });

  it("returns completed track status for mock tasks", async () => {
    const response = await generateStatusGet(
      new Request("http://localhost/api/generate/status?taskId=mock-task")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("complete");
    expect(body.track.audioUrl).toBe("/audio/mock-track.wav");
  });
});

describe("externalMusicProvider", () => {
  it("starts a Kie generation request and returns a task id", async () => {
    vi.stubEnv("KIE_API_KEY", "test-key");
    vi.stubEnv("KIE_API_BASE_URL", "https://api.kie.ai");
    vi.stubEnv("KIE_MODEL", "V4");
    vi.stubEnv("KIE_CALLBACK_URL", "https://example.com/api/generate/callback");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: 200, msg: "success", data: { taskId: "task-123" } }), { status: 200 })
    );

    const job = await externalMusicProvider.start({
      prompt: "slow piano, melancholic mood",
      sourceBookTitle: "The Winter Archive",
      sourceAuthor: "Mina Park",
      durationSeconds: 60
    });

    expect(job.taskId).toBe("task-123");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.kie.ai/api/v1/generate");
    expect(init?.headers).toMatchObject({ authorization: "Bearer test-key" });
    expect(JSON.parse(init?.body as string)).toMatchObject({
      customMode: true,
      instrumental: true,
      model: "V4",
      style: "piano, melancholic, slow tempo",
      title: "The Winter Archive"
    });
  });

  it("maps a successful Kie status response to a generated track", async () => {
    vi.stubEnv("KIE_API_KEY", "test-key");
    vi.stubEnv("KIE_API_BASE_URL", "https://api.kie.ai");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 200,
          msg: "success",
          data: {
            taskId: "task-123",
            status: "SUCCESS",
            response: {
              sunoData: [
                {
                  id: "audio-1",
                  audioUrl: "https://cdn.example.com/audio.mp3",
                  title: "Generated Song",
                  prompt: "slow piano",
                  duration: 198.44
                }
              ]
            }
          }
        }),
        { status: 200 }
      )
    );

    const status = await externalMusicProvider.getStatus("task-123");

    expect(status.status).toBe("complete");
    expect(status.track?.audioUrl).toBe("https://cdn.example.com/audio.mp3");
    expect(status.track?.title).toBe("Generated Song");
  });
});
