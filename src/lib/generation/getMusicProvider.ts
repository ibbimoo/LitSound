import type { MusicProvider } from "@/lib/generation/MusicProvider";
import { externalMusicProvider } from "@/lib/generation/externalMusicProvider";
import { mockMusicProvider } from "@/lib/generation/mockMusicProvider";

export function getMusicProvider(mode = process.env.MUSIC_PROVIDER_MODE ?? "mock"): MusicProvider {
  return mode === "external" ? externalMusicProvider : mockMusicProvider;
}
