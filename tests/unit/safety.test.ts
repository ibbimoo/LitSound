import { describe, expect, it } from "vitest";
import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";
import { sanitizeExcerpt } from "@/lib/safety/sanitizeExcerpt";

describe("sanitizeExcerpt", () => {
  it("trims whitespace and accepts short excerpts", () => {
    expect(sanitizeExcerpt("  slow piano in a dark room  ")).toBe("slow piano in a dark room");
  });

  it("rejects excerpts over 1500 characters", () => {
    expect(() => sanitizeExcerpt("a".repeat(1501))).toThrow("Excerpt must be 1500 characters or fewer.");
  });
});

describe("rewriteArtistImitation", () => {
  it("rewrites named artist imitation into generic traits", () => {
    const result = rewriteArtistImitation("Make this sound like Taylor Swift with bright pop vocals.");

    expect(result.rewrittenPrompt).toContain("bright pop vocals");
    expect(result.rewrittenPrompt).not.toContain("Taylor Swift");
    expect(result.wasRewritten).toBe(true);
  });

  it("leaves generic style prompts unchanged", () => {
    const result = rewriteArtistImitation("slow chamber folk with muted strings");

    expect(result.rewrittenPrompt).toBe("slow chamber folk with muted strings");
    expect(result.wasRewritten).toBe(false);
  });
});
