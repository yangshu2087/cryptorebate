import { describe, expect, it } from "vitest";
import { getIntlMiddlewareRouting } from "./middleware-config";

describe("getIntlMiddlewareRouting", () => {
  it("disables next-intl alternate link headers so x-default only comes from page metadata", () => {
    expect(getIntlMiddlewareRouting().alternateLinks).toBe(false);
  });
});
