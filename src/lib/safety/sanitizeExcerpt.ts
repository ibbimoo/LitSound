const MAX_EXCERPT_LENGTH = 1500;

export function sanitizeExcerpt(input: string): string {
  const excerpt = input.trim();

  if (excerpt.length === 0) {
    throw new Error("Excerpt is required.");
  }

  if (excerpt.length > MAX_EXCERPT_LENGTH) {
    throw new Error("Excerpt must be 1500 characters or fewer.");
  }

  return excerpt;
}
