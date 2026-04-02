import { describe, expect, it } from "vitest";
import { getHomepageSectionFlags } from "./homepage-flags";

describe("getHomepageSectionFlags", () => {
  it("hides the autonomous SEO / GEO queue from the public homepage", () => {
    expect(getHomepageSectionFlags("en").showAutomationQueue).toBe(false);
    expect(getHomepageSectionFlags("zh").showAutomationQueue).toBe(false);
  });
});
