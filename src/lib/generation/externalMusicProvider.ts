import type { GenerateMusicInput, MusicProvider } from "@/lib/generation/MusicProvider";

type KieGenerateResponse = {
  code: number;
  msg?: string;
  data?: {
    taskId?: string;
  };
};

type KieStatusResponse = {
  code: number;
  msg?: string;
  data?: {
    taskId?: string;
    status?: string;
    errorMessage?: string;
    response?: {
      sunoData?: Array<{
        id?: string;
        audioUrl?: string;
        streamAudioUrl?: string;
        title?: string;
        prompt?: string;
        duration?: number;
      }>;
    };
  };
};

const COMPLETE_STATUSES = new Set(["SUCCESS", "FIRST_SUCCESS"]);
const FAILED_STATUSES = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR"
]);

export const externalMusicProvider: MusicProvider = {
  async start(input) {
    const config = getKieConfig();
    const response = await fetch(`${config.baseUrl}/api/v1/generate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(buildKieGenerateBody(input, config))
    });
    const result = await response.json() as KieGenerateResponse;

    if (!response.ok || result.code !== 200 || !result.data?.taskId) {
      throw new Error(result.msg ?? "Kie music generation request failed.");
    }

    return {
      taskId: result.data.taskId,
      status: "processing"
    };
  },

  async getStatus(taskId) {
    const config = getKieConfig();
    const response = await fetch(`${config.baseUrl}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${config.apiKey}`
      }
    });
    const result = await response.json() as KieStatusResponse;

    if (!response.ok || result.code !== 200 || !result.data) {
      throw new Error(result.msg ?? "Kie music status request failed.");
    }

    const status = result.data.status ?? "PENDING";
    if (FAILED_STATUSES.has(status)) {
      return {
        taskId,
        status: "failed",
        error: result.data.errorMessage ?? status
      };
    }

    if (!COMPLETE_STATUSES.has(status)) {
      return {
        taskId,
        status: "processing"
      };
    }

    const track = result.data.response?.sunoData?.find((item) => item.audioUrl || item.streamAudioUrl);
    if (!track) {
      return {
        taskId,
        status: "processing"
      };
    }

    return {
      taskId,
      status: "complete",
      track: {
        id: track.id ?? taskId,
        audioUrl: track.audioUrl ?? track.streamAudioUrl ?? "",
        title: track.title ?? "Generated Reading Theme",
        description: track.prompt ?? "Generated with Kie Suno API",
        durationSeconds: Math.round(track.duration ?? 0),
        generationStatus: "complete",
        createdAt: new Date().toISOString(),
        sourceBookTitle: "LitSound",
        sourceAuthor: "Kie Suno API"
      }
    };
  }
};

type KieConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  callBackUrl: string;
};

function getKieConfig(): KieConfig {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured.");
  }

  return {
    apiKey,
    baseUrl: process.env.KIE_API_BASE_URL ?? "https://api.kie.ai",
    model: process.env.KIE_MODEL ?? "V4",
    callBackUrl: process.env.KIE_CALLBACK_URL ?? "https://lit-sound.vercel.app/api/generate/callback"
  };
}

function buildKieGenerateBody(input: GenerateMusicInput, config: KieConfig) {
  const style = buildStyle(input.prompt);

  return {
    prompt: input.prompt.slice(0, 3000),
    customMode: true,
    instrumental: true,
    model: config.model,
    callBackUrl: config.callBackUrl,
    style: style.slice(0, 200),
    title: input.sourceBookTitle.slice(0, 80),
    negativeTags: "Heavy Metal, Upbeat Drums, aggressive distortion",
    styleWeight: 0.65,
    weirdnessConstraint: 0.45,
    audioWeight: 0.65
  };
}

function buildStyle(prompt: string): string {
  const lower = prompt.toLowerCase();
  const styles = new Set<string>();

  if (/piano/.test(lower)) styles.add("piano");
  if (/strings|violin|cello/.test(lower)) styles.add("strings");
  if (/jazz/.test(lower)) styles.add("jazz");
  if (/classical|chamber/.test(lower)) styles.add("classical");
  if (/melancholic|sad|lonely/.test(lower)) styles.add("melancholic");
  if (/warm|soft/.test(lower)) styles.add("soft");
  if (/slow/.test(lower)) styles.add("slow tempo");

  return styles.size > 0 ? Array.from(styles).join(", ") : "cinematic, reflective, literary";
}
