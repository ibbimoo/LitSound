import { expect, test } from "@playwright/test";

test("user can analyze a book excerpt and generate a playable track on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("책 제목").fill("The Winter Archive");
  await page.getByLabel("작가").fill("Mina Park");
  await page.getByLabel("줄거리 또는 장면 설명").fill("A quiet literary novel about grief, snow, and memory.");
  await page.getByLabel("책 속 음악 묘사").fill("A slow piano song about never forgetting the sea.");

  await page.getByRole("button", { name: "분석하기" }).click();
  await expect(page.getByText("분석 결과")).toBeVisible();
  await expect(page.getByText("악기: piano")).toBeVisible();

  await page.getByRole("button", { name: "음악 생성하기" }).click();
  await expect(page.getByText("Generated Reading Theme")).toBeVisible();
  await expect(page.locator("audio")).toHaveAttribute("src", "/audio/mock-track.wav");

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("analysis API rejects oversized excerpts", async ({ request }) => {
  const response = await request.post("/api/analyze", {
    data: {
      title: "Long Book",
      author: "Long Author",
      optionalSummary: "",
      excerpt: "a".repeat(1501),
      includeLyrics: false,
      durationSeconds: 60,
      adjustments: [],
      bookMoodWeight: "medium"
    }
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBe("Excerpt must be 1500 characters or fewer.");
});
