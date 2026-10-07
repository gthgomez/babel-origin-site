import { parseChangelogEntries } from "../src/lib/product-content";

export function parseChangelogForTest(input: unknown) {
  return parseChangelogEntries(input);
}
